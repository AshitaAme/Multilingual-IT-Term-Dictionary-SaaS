'use server';

import { parseTbx } from './parse-tbx';
import {
  insertTerms,
  TermInput,
  upsertTerms,
} from '../db/mutations/term.mutations';
import { AIEnrichTerm } from '../ai/AI-enrich-term';
import { NotFoundError } from '@/shared/errors/errors';
import slugify from 'slugify';
import {
  insertTags,
  TagInput,
  upsertTags,
} from '../db/mutations/tag.mutations';
import {
  insertTagTranslations,
  TagTranslationInput,
  upsertTagTranslations,
} from '../db/mutations/tag-translation.mutations';
import {
  insertTermTags,
  TermTagInput,
} from '../db/mutations/term-tag.mutations';
import {
  insertTermTranslations,
  TermTranslationInput,
  upsertTermTranslations,
} from '../db/mutations/term-translation.mutations';

import { setTimeout } from 'node:timers/promises';
import { ParsedTerm, EnrichedTerm } from './parse-schemas';
import { auth } from '../auth/auth';
import * as fs from 'node:fs';

/**
 * Parse a TBX file, enrich every term with AI metadata, then persist all
 * to the database.
 *
 * Bulk writes are chunked into batches of {@link DB_BATCH_SIZE} rows and
 * wrapped with {@link withRetry} so transient database errors do not abort
 * an otherwise-valid import.
 */
export async function transferTbx({
  xml,
  allowUpdate = false,
}: {
  xml: string;
  allowUpdate?: boolean;
}) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    throw new NotFoundError('User not found');
  }

  const parsedTerms: ParsedTerm[] = parseTbx(xml);
  const enrichedTerms: EnrichedTerm[] = await AIEnrichTerm(parsedTerms);

  // 1. Build term & tag payloads
  const termPayloads: TermInput[] = [];
  const tagPayloads: TagInput[] = [];
  // Keep track of the relationship between term and tags
  const termTagMap = new Map<string, string[]>(); // termSlug → tagSlug[]
  const termSet = new Set<string>();
  const tagSet = new Set<string>();

  for (const enrichedTerm of enrichedTerms) {
    const { source, sourceTags } = enrichedTerm;
    const termSlug = slugify(source);

    // 1.1 Check same term slug
    if (termSet.has(termSlug)) continue;
    termSet.add(termSlug);

    // 1.2 Build term payload
    const termPayload: TermInput = {
      slug: termSlug,
      createdBy: userId,
    };
    termPayloads.push(termPayload);

    // 1.4 Build tag payload
    if (!sourceTags) continue;
    termTagMap.set(termSlug, []);

    for (const tag of sourceTags) {
      // 1.5 Associate tag with term
      const tagSlug = slugify(tag);
      termTagMap.get(termSlug)!.push(tagSlug);

      // 1.6 Check same tag slug
      if (tagSet.has(tagSlug)) continue;

      // 1.7 Build tag payload
      tagSet.add(tagSlug);
      const tagPayload: TagInput = {
        slug: tagSlug,
        color: pickTagColor(),
      };
      tagPayloads.push(tagPayload);
    }
  }

  // Write log
  fs.writeFileSync(
    './transfer-tbx-terms.log',
    JSON.stringify(termPayloads, null, 2),
    'utf-8',
  );
  // 2. Persist terms & tags
  const terms = allowUpdate
    ? await batchCollect(termPayloads, upsertTerms)
    : await batchCollect(termPayloads, insertTerms);
  const tags = allowUpdate
    ? await batchCollect(tagPayloads, upsertTags)
    : await batchCollect(tagPayloads, insertTags);

  fs.writeFileSync(
    './transfer-tbx-term.log',
    JSON.stringify(terms ?? [], null, 2),
    'utf-8',
  );

  // Keep track of the relationship between slug and id of term and tag
  const termSlugIdMap = new Map(terms.map((t) => [t.slug, t.id]));
  const tagSlugIdMap = new Map(tags.map((t) => [t.slug, t.id]));

  // 3. Build translations & associations
  const termTranslationPayloads: TermTranslationInput[] = [];
  const tagTranslationPayloads: TagTranslationInput[] = [];
  const termTagPayloads: TermTagInput[] = [];

  termSet.clear();
  tagSet.clear();
  const termTagSet = new Set<string>();

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
    if (!termSet.has(termId)) {
      termSet.add(termId);
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
    }

    // 3.2 Build term tag associations

    const tagSlugs = termTagMap.get(slugify(source));
    tagSlugs?.forEach((tagSlug) => {
      const tagId = tagSlugIdMap.get(tagSlug)!; // For one unique slug, there must be one id
      const termTagId = termId + '#' + tagId;
      if (!termTagSet.has(termTagId)) {
        termTagSet.add(termTagId);
        termTagPayloads.push({ termId, tagId });
      }
    });

    // 3.3 Build tag translations

    sourceTags?.forEach((sourceTag, index) => {
      // SourceTags and targetTags are guaranteed to have the same length in AIEnrichTerm()
      // so we can safely index into targetTags by position.
      const tagId = tagSlugIdMap.get(slugify(sourceTag))!;
      if (!tagSet.has(tagId)) {
        tagSet.add(tagId);
        const targetTag = targetTags![index];
        tagTranslationPayloads.push(
          { tagId, languageCode: sourceLang, name: sourceTag },
          { tagId, languageCode: targetLang, name: targetTag },
        );
      }
    });
  }

  fs.writeFileSync(
    './transfer-tbx-termTranslation.log',
    JSON.stringify(termTranslationPayloads ?? [], null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    './transfer-tbx-termTag.log',
    JSON.stringify(termTagPayloads ?? [], null, 2),
    'utf-8',
  );
  fs.writeFileSync(
    './transfer-tbx-tagTranslation.log',
    JSON.stringify(tagTranslationPayloads ?? [], null, 2),
    'utf-8',
  );

  // 4: persist translations & associations in batches
  if (allowUpdate) {
    await batchInsert(termTranslationPayloads, upsertTermTranslations);
    await batchInsert(termTagPayloads, insertTermTags);
    await batchInsert(tagTranslationPayloads, upsertTagTranslations);
  } else {
    await batchInsert(termTranslationPayloads, insertTermTranslations);
    await batchInsert(termTagPayloads, insertTermTags);
    await batchInsert(tagTranslationPayloads, insertTagTranslations);
  }
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
const DB_BATCH_SIZE = 20;

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

async function batchCollect<T, R>(
  items: T[],
  fn: (batch: T[]) => Promise<R[]>,
  size = DB_BATCH_SIZE,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = await withRetry(() => fn(items.slice(i, i + size)));
    results.push(...batch);
  }
  return results;
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
