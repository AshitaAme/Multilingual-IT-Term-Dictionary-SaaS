import { getSession } from 'next-auth/react';
import { parseTbx } from './parse-tbx';
import { TermInput, upsertTerms } from '../db/mutations/term.mutations';
import { AIEnrichTerm } from '../ai/AI-enrich-term';
import { NotFoundError } from '@/shared/errors/errors';
import slugify from 'slugify';
import { TagInput, upsertTags } from '../db/mutations/tag.mutations';
import {
  TagTranslationInput,
  upsertTagTranslations,
} from '../db/mutations/tag-translation.mutations';
import {
  insertTermTags,
  TermTagInput,
} from '../db/mutations/term-tag.mutations';
import {
  TermTranslationInput,
  upsertTermTranslations,
} from '../db/mutations/term-translation.mutations';

import { z } from 'zod';
import { setTimeout } from 'node:timers/promises';

export const ParsedTermSchema = z.object({
  source: z.string(), // source language term
  sourceLang: z.string(), // source language code
  target: z.string(), // target language term
  targetLang: z.string(), // target language code
  sourceDefinition: z.string().optional(), // optional definition from descripGrp
});

export const EnrichedTermSchema = ParsedTermSchema.extend({
  targetDefinition: z.string().optional(),
  sourceTags: z.array(z.string()).optional(),
  targetTags: z.array(z.string()).optional(),
});

export type ParsedTerm = z.infer<typeof ParsedTermSchema>;
export type EnrichedTerm = z.infer<typeof EnrichedTermSchema>;

/**
 * Parse a TBX file, enrich every term with AI metadata, then persist all
 * to the database.
 *
 * Bulk writes are chunked into batches of {@link DB_BATCH_SIZE} rows and
 * wrapped with {@link withRetry} so transient database errors do not abort
 * an otherwise-valid import.
 */
export async function transferTbx(filePath: string) {
  const session = await getSession();
  const userId = session?.user.id;
  if (!userId) {
    throw new NotFoundError('User not found');
  }

  const parsedTerms: ParsedTerm[] = parseTbx(filePath);
  const enrichedTerms: EnrichedTerm[] = await AIEnrichTerm(parsedTerms);

  // 1. Build term & tag payloads

  const termPayloads: TermInput[] = [];
  const tagPayloads: TagInput[] = [];
  // Keep track of the relationship between term and tags
  const termTagMap = new Map<string, string[]>(); // termSlug → tagSlug[]

  for (const enrichedTerm of enrichedTerms) {
    const { source, sourceTags } = enrichedTerm;
    const termPayload: TermInput = {
      slug: slugify(source),
      createdBy: userId,
    };
    termPayloads.push(termPayload);

    if (!sourceTags) continue;

    termTagMap.set(termPayload.slug, []);
    for (const tag of sourceTags) {
      const tagPayload: TagInput = {
        slug: slugify(tag),
        color: pickTagColor(),
      };
      tagPayloads.push(tagPayload);
      termTagMap.get(termPayload.slug)!.push(tagPayload.slug);
    }
  }

  // 2. Persist terms & tags
  const [terms, tags] = await Promise.all([
    withRetry(() => upsertTerms(termPayloads)),
    withRetry(() => upsertTags(tagPayloads)),
  ]);

  // Keep track of the relationship between slug and id of term and tag
  const termSlugIdMap = new Map(terms.map((t) => [t.slug, t.id]));
  const tagSlugIdMap = new Map(tags.map((t) => [t.slug, t.id]));

  // 3. Build translations & associations
  const termTranslationPayloads: TermTranslationInput[] = [];
  const tagTranslationPayloads: TagTranslationInput[] = [];
  const termTagPayloads: TermTagInput[] = [];

  for (const enrichedTerm of enrichedTerms) {
    const {
      source,
      sourceLang,
      sourceDefinition,
      sourceTags,
      target,
      targetLang,
      targetDefinition,
      targetTags,
    } = enrichedTerm;

    const termId = termSlugIdMap.get(slugify(source))!;

    // 3.1 Build term translations
    // Each term has two translations: source language + target language.
    termTranslationPayloads.push(
      {
        termId,
        languageCode: sourceLang,
        name: source,
        definition: sourceDefinition,
        createdBy: userId,
      },
      {
        termId,
        languageCode: targetLang,
        name: target,
        definition: targetDefinition,
        createdBy: userId,
      },
    );

    // 3.2 Build term tag associations

    const tagSlugs = termTagMap.get(slugify(source));
    tagSlugs?.forEach((tagSlug) => {
      const tagId = tagSlugIdMap.get(tagSlug)!; // For one unique slug, there must be one id
      termTagPayloads.push({ termId, tagId });
    });

    // 3.3 Build tag translations

    sourceTags?.forEach((sourceTag, index) => {
      // SourceTags and targetTags are guaranteed to have the same length in AIEnrichTerm()
      // so we can safely index into targetTags by position.
      const tagId = tagSlugIdMap.get(slugify(sourceTag))!;
      const targetTag = targetTags![index];
      tagTranslationPayloads.push(
        { tagId, languageCode: sourceLang, name: sourceTag },
        { tagId, languageCode: targetLang, name: targetTag },
      );
    });
  }

  // 4: persist translations & associations in batches
  await Promise.all([
    batchInsert(termTranslationPayloads, upsertTermTranslations),
    batchInsert(termTagPayloads, insertTermTags),
    batchInsert(tagTranslationPayloads, upsertTagTranslations),
  ]);
}

/** Pick a random color for a tag from predefined set. */

const TAG_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
  '#F59E0B', // amber
];

function pickTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

/** Maximum rows per INSERT statement. */
const DB_BATCH_SIZE = 500;

/** Splice large data persistence into multiple batches
 * so that database won't crash
 */
async function batchInsert<T>(
  items: T[],
  fn: (batch: T[]) => Promise<void>,
  size = DB_BATCH_SIZE,
): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await withRetry(() => fn(items.slice(i, i + size)));
  }
}

/**
 * Retry function with exponential back-off on failure.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        // Exponential back-off: 500 ms → 1 s → 2 s
        await setTimeout(500 * 2 ** attempt);
      }
    }
  }
  console.log(`Retry failed: ${lastError}`);
  throw lastError;
}
