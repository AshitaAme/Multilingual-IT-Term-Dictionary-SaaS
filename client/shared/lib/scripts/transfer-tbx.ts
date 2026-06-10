'use server';

import { parseTbx } from './parse-tbx';
import { AIEnrichTerm } from '../ai/AI-enrich-term';
import { NotFoundError } from '@/shared/errors/errors';
import { auth } from '../auth/auth';
import type { Pool } from 'pg';
import slugify from 'slugify';
import { randomUUID } from 'node:crypto';

import type { ParsedTerm, EnrichedTerm } from './parse-schemas';
import { uploadCsvToS3 } from '../aws/s3-csv';
import { copyInsert, copyUpsert } from '../db/pg-copy';
import {
  TermRow,
  TagRow,
  TermTranslationRow,
  TagTranslationRow,
  TermTagRow,
  TERM_COLS,
  TAG_COLS,
  TERM_TRANSLATION_COLS,
  TAG_TRANSLATION_COLS,
  TERM_TAG_COLS,
} from './transfer-types';
import { pgPool } from '../db/db-pool';
import { getTableName } from 'drizzle-orm';
import {
  tags,
  tagTranslations,
  terms,
  termTags,
  termTranslations,
} from '../db/schemas/dictionary.schema';

export async function transferTbx(formData: FormData) {
  // 1. Check auth
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) throw new NotFoundError('User not found');

  // 2. Parse and enrich terms
  const file = formData.get('file') as File;
  const xml = await file.text();
  const parsedTerms: ParsedTerm[] = parseTbx(xml);
  const enrichedTerms: EnrichedTerm[] = await AIEnrichTerm(parsedTerms);

  // 3. Build payloads
  const {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  } = buildPayloads(enrichedTerms, userId);
  console.log('Payload building complete');

  // 4. Upload files to AWS S3 for backup
  const prefix = randomUUID();
  await uploadFiles(prefix, {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  });
  console.log('File uploading complete');

  // 5. Transfer data using pg copy
  const pool = pgPool;
  try {
    await bulkWrite(pool, {
      termRows,
      tagRows,
      termTranslationRows,
      tagTranslationRows,
      termTagRows,
    });
  } catch (err) {
    console.error(
      `[${transferTbx.name}] COPY failed – S3 staging files retained at`,
      err,
    );
    throw err;
  }
  console.log('Data transferring complete');
}

/**
 * Build payloads for transferring to database
 */
function buildPayloads(
  enrichedTerms: EnrichedTerm[],
  userId: string,
): {
  termRows: TermRow[];
  tagRows: TagRow[];
  termTranslationRows: TermTranslationRow[];
  tagTranslationRows: TagTranslationRow[];
  termTagRows: TermTagRow[];
} {
  const termSlugIdMap = new Map<string, string>(); // slug → uuid
  const tagSlugIdMap = new Map<string, string>(); // slug → uuid

  const termRows: TermRow[] = [];
  const tagRows: TagRow[] = [];

  const seenTermSlugs = new Set<string>(); // Remove duplicates
  const seenTagSlugs = new Set<string>();

  const termTagMap = new Map<string, string[]>(); // termSlug -> tagSlugs

  // 1. Build term and tag payloads, and their relations
  for (const et of enrichedTerms) {
    const termSlug = slugify(et.source);

    if (!seenTermSlugs.has(termSlug)) {
      seenTermSlugs.add(termSlug);
      const termId = randomUUID();
      termSlugIdMap.set(termSlug, termId);
      termRows.push({ id: termId, slug: termSlug, created_by: userId });
    }

    if (!et.sourceTags) continue;
    termTagMap.set(termSlug, []);

    for (const sourceTag of et.sourceTags) {
      const tagSlug = slugify(sourceTag);
      termTagMap.get(termSlug)!.push(tagSlug);

      if (!seenTagSlugs.has(tagSlug)) {
        seenTagSlugs.add(tagSlug);
        const tagId = randomUUID();
        tagSlugIdMap.set(tagSlug, tagId);
        tagRows.push({ id: tagId, slug: tagSlug, color: pickTagColor() });
      }
    }
  }

  const termTranslationRows: TermTranslationRow[] = [];
  const tagTranslationRows: TagTranslationRow[] = [];
  const termTagRows: TermTagRow[] = [];

  const seenTermTrans = new Set<string>(); // termId
  const seenTagTrans = new Set<string>(); // tagId
  const seenTermTags = new Set<string>(); // termId#tagId

  // 2. Build termTranslation, termTag, and tagTranslation payloads
  for (const et of enrichedTerms) {
    const {
      source,
      sourceLang,
      sourceDefinition,
      sourceTags,
      target,
      targetLang,
      targetDefinition,
      targetTags,
    } = et;

    const termSlug = slugify(source);
    const termId = termSlugIdMap.get(termSlug)!;

    // 2.1 Term translations
    if (!seenTermTrans.has(termId)) {
      seenTermTrans.add(termId);
      termTranslationRows.push(
        {
          term_id: termId,
          language_code: sourceLang,
          name: source,
          definition: sourceDefinition,
          created_by: userId,
        },
        {
          term_id: termId,
          language_code: targetLang,
          name: target,
          definition: targetDefinition,
          created_by: userId,
        },
      );
    }

    // 2.2 Term tag associations
    termTagMap.get(termSlug)?.forEach((tagSlug) => {
      const tagId = tagSlugIdMap.get(tagSlug)!;
      const pairKey = `${termId}#${tagId}`;
      if (!seenTermTags.has(pairKey)) {
        seenTermTags.add(pairKey);
        termTagRows.push({ term_id: termId, tag_id: tagId });
      }
    });

    // 2.3 Tag translations
    sourceTags?.forEach((sourceTag, i) => {
      const tagId = tagSlugIdMap.get(slugify(sourceTag))!;
      if (!seenTagTrans.has(tagId)) {
        seenTagTrans.add(tagId);
        const targetTag = targetTags![i];
        tagTranslationRows.push(
          { tag_id: tagId, language_code: sourceLang, name: sourceTag },
          { tag_id: tagId, language_code: targetLang, name: targetTag },
        );
      }
    });
  }

  return {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  };
}

/**
 * Upload data to AWS S3 in .csv format for backup
 */
async function uploadFiles(
  runId: string,
  payloads: {
    termRows: TermRow[];
    tagRows: TagRow[];
    termTranslationRows: TermTranslationRow[];
    tagTranslationRows: TagTranslationRow[];
    termTagRows: TermTagRow[];
  },
) {
  const prefix = `tbx-imports/${runId}`;

  const keys = [
    `${prefix}/terms.csv`,
    `${prefix}/tags.csv`,
    `${prefix}/term_translations.csv`,
    `${prefix}/tag_translations.csv`,
    `${prefix}/term_tags.csv`,
  ];

  try {
    await Promise.all([
      uploadCsvToS3(keys[0], payloads.termRows),
      uploadCsvToS3(keys[1], payloads.tagRows),
      uploadCsvToS3(keys[2], payloads.termTranslationRows),
      uploadCsvToS3(keys[3], payloads.tagTranslationRows),
      uploadCsvToS3(keys[4], payloads.termTagRows),
    ]);
  } catch (err) {
    console.warn('[transferTbx] S3 backup failed, continuing anyway', err);
  }
}

/**
 * Transfer batches of data to database
 */
async function bulkWrite(
  pool: Pool,
  payloads: {
    termRows: TermRow[];
    tagRows: TagRow[];
    termTranslationRows: TermTranslationRow[];
    tagTranslationRows: TagTranslationRow[];
    termTagRows: TermTagRow[];
  },
): Promise<void> {
  const {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  } = payloads;

  await Promise.all([
    copyInsert<TermRow>({
      pool,
      table: getTableName(terms),
      columns: [...TERM_COLS],
      rows: termRows,
    }),
    copyInsert<TagRow>({
      pool,
      table: getTableName(tags),
      columns: [...TAG_COLS],
      rows: tagRows,
    }),
  ]);

  await Promise.all([
    copyUpsert<TermTranslationRow>({
      pool,
      table: getTableName(termTranslations),
      columns: [...TERM_TRANSLATION_COLS],
      rows: termTranslationRows,
      conflictColumns: ['term_id', 'language_code'],
      updateColumns: ['name', 'definition'],
    }),
    copyUpsert<TagTranslationRow>({
      pool,
      table: getTableName(tagTranslations),
      columns: [...TAG_TRANSLATION_COLS],
      rows: tagTranslationRows,
      conflictColumns: ['tag_id', 'language_code'],
      updateColumns: ['name'],
    }),
    copyInsert<TermTagRow>({
      pool,
      table: getTableName(termTags),
      columns: [...TERM_TAG_COLS],
      rows: termTagRows,
    }),
  ]);
}

const TAG_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
  '#F59E0B',
];

function pickTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}
