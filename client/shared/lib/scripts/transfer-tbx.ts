'use server';

/**
 * transfer-tbx.ts  (refactored)
 *
 * Pipeline:
 *   1. Parse TBX XML → enrich with AI
 *   2. Build all payloads (terms, tags, translations, associations)
 *   3. Serialize payloads to CSV and upload to S3 in parallel  ← staging / audit
 *   4. Stream each CSV into Postgres via COPY FROM STDIN        ← fast bulk write
 *   5. Delete S3 staging files (fire-and-forget; kept on error for audit)
 */

import { parseTbx } from './parse-tbx';
import { AIEnrichTerm } from '../ai/AI-enrich-term';
import { NotFoundError } from '@/shared/errors/errors';
import { auth } from '../auth/auth';
import { pgPool } from '../db/db';
import type { Pool } from 'pg';
import slugify from 'slugify';
import { randomUUID } from 'node:crypto';

import type { ParsedTerm, EnrichedTerm } from './parse-schemas';
import { deleteCsvFromS3, uploadCsvToS3 } from '../aws/s3-csv';
import { copyInsert, copyUpsert } from '../db/pg-copy';

// ─── columns ───────────────────────────

const TERM_COLS = ['id', 'slug', 'created_by'] as const;
const TAG_COLS = ['id', 'slug', 'color'] as const;
const TERM_TRANSLATION_COLS = [
  'term_id',
  'language_code',
  'name',
  'definition',
  'created_by',
] as const;
const TAG_TRANSLATION_COLS = ['tag_id', 'language_code', 'name'] as const;
const TERM_TAG_COLS = ['term_id', 'tag_id'] as const;

// ─── types for CSV rows ────────────────────────
interface TermRow {
  id: string;
  slug: string;
  created_by: string;
}
interface TagRow {
  id: string;
  slug: string;
  color: string;
}
interface TermTranslationRow {
  term_id: string;
  language_code: string;
  name: string;
  definition?: string;
  created_by: string;
}
interface TagTranslationRow {
  tag_id: string;
  language_code: string;
  name: string;
}
interface TermTagRow {
  term_id: string;
  tag_id: string;
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function transferTbx({
  xml,
  allowUpdate = false,
}: {
  xml: string;
  allowUpdate?: boolean;
}) {
  // ── auth ──────────────────────────────────────────────────────────────────
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) throw new NotFoundError('User not found');

  // ── parse + AI enrich ─────────────────────────────────────────────────────
  const parsedTerms: ParsedTerm[] = parseTbx(xml);
  const enrichedTerms: EnrichedTerm[] = await AIEnrichTerm(parsedTerms);

  // ── build payloads ────────────────────────────────────────────────────────
  const {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  } = buildPayloads(enrichedTerms, userId);

  // ── S3 staging: upload all tables in parallel ─────────────────────────────
  const runId = randomUUID(); // one prefix per import run
  const s3Keys = await uploadStagingFiles(runId, {
    termRows,
    tagRows,
    termTranslationRows,
    tagTranslationRows,
    termTagRows,
  });

  // ── pg COPY ───────────────────────────────────────────────────────────────
  // Drizzle exposes the underlying pg.Pool via $client
  const pool = pgPool;

  try {
    await bulkWrite(pool, allowUpdate, {
      termRows,
      tagRows,
      termTranslationRows,
      tagTranslationRows,
      termTagRows,
    });
  } catch (err) {
    // Leave S3 files intact so the failed import can be inspected / replayed
    console.error(
      '[transferTbx] COPY failed – S3 staging files retained at',
      s3Keys,
    );
    throw err;
  }

  // ── cleanup S3 staging files (fire-and-forget) ────────────────────────────
  void Promise.allSettled(s3Keys.map(deleteCsvFromS3)).then((results) => {
    results.forEach((r, i) => {
      if (r.status === 'rejected')
        console.warn(
          '[transferTbx] Failed to delete S3 staging file',
          s3Keys[i],
          r.reason,
        );
    });
  });
}

// ─── payload builder ──────────────────────────────────────────────────────────

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
  // Use temporary UUIDs for term/tag IDs so that we can build all foreign-key
  // relationships in-memory without an extra database round-trip.
  const termSlugIdMap = new Map<string, string>(); // slug → uuid
  const tagSlugIdMap = new Map<string, string>(); // slug → uuid

  const termRows: TermRow[] = [];
  const tagRows: TagRow[] = [];
  const termTranslationRows: TermTranslationRow[] = [];
  const tagTranslationRows: TagTranslationRow[] = [];
  const termTagRows: TermTagRow[] = [];

  // Track what we've already emitted to avoid duplicates
  const seenTermSlugs = new Set<string>();
  const seenTagSlugs = new Set<string>();
  const seenTermTrans = new Set<string>(); // termId
  const seenTagTrans = new Set<string>(); // tagId
  const seenTermTags = new Set<string>(); // termId#tagId

  // ── termTagMap: source term slug → tag slugs ──────────────────────────────
  const termTagMap = new Map<string, string[]>();

  // ── pass 1: collect unique terms and tags ─────────────────────────────────
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

  // ── pass 2: build translations + associations ─────────────────────────────
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

    // Term translations (one pair per unique term)
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

    // Term ↔ tag associations
    termTagMap.get(termSlug)?.forEach((tagSlug) => {
      const tagId = tagSlugIdMap.get(tagSlug)!;
      const pairKey = `${termId}#${tagId}`;
      if (!seenTermTags.has(pairKey)) {
        seenTermTags.add(pairKey);
        termTagRows.push({ term_id: termId, tag_id: tagId });
      }
    });

    // Tag translations
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

// ─── S3 staging ───────────────────────────────────────────────────────────────

async function uploadStagingFiles(
  runId: string,
  payloads: {
    termRows: TermRow[];
    tagRows: TagRow[];
    termTranslationRows: TermTranslationRow[];
    tagTranslationRows: TagTranslationRow[];
    termTagRows: TermTagRow[];
  },
): Promise<string[]> {
  const prefix = `tbx-imports/${runId}`;

  const keys = [
    `${prefix}/terms.csv`,
    `${prefix}/tags.csv`,
    `${prefix}/term_translations.csv`,
    `${prefix}/tag_translations.csv`,
    `${prefix}/term_tags.csv`,
  ];

  await Promise.all([
    uploadCsvToS3(keys[0], payloads.termRows),
    uploadCsvToS3(keys[1], payloads.tagRows),
    uploadCsvToS3(keys[2], payloads.termTranslationRows),
    uploadCsvToS3(keys[3], payloads.tagTranslationRows),
    uploadCsvToS3(keys[4], payloads.termTagRows),
  ]);

  return keys;
}

// ─── pg COPY orchestration ────────────────────────────────────────────────────

async function bulkWrite(
  pool: Pool,
  allowUpdate: boolean,
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

  if (allowUpdate) {
    // ── upsert path: COPY → temp → INSERT ON CONFLICT ─────────────────────
    // Terms and tags must land first (FK targets)
    await Promise.all([
      copyInsert<TermRow>({
        pool,
        table: 'terms',
        columns: [...TERM_COLS],
        rows: termRows,
      }),
      copyInsert<TagRow>({
        pool,
        table: 'tags',
        columns: [...TAG_COLS],
        rows: tagRows,
      }),
    ]);

    // Then translations + associations (depend on term/tag IDs)
    await Promise.all([
      copyUpsert<TermTranslationRow>({
        pool,
        table: 'term_translations',
        columns: [...TERM_TRANSLATION_COLS],
        rows: termTranslationRows,
        conflictColumns: ['term_id', 'language_code'],
        updateColumns: ['name', 'definition'],
      }),
      copyUpsert<TagTranslationRow>({
        pool,
        table: 'tag_translations',
        columns: [...TAG_TRANSLATION_COLS],
        rows: tagTranslationRows,
        conflictColumns: ['tag_id', 'language_code'],
        updateColumns: ['name'],
      }),
      copyInsert<TermTagRow>({
        // associations: ignore duplicates via DO NOTHING handled in schema
        pool,
        table: 'term_tags',
        columns: [...TERM_TAG_COLS],
        rows: termTagRows,
      }),
    ]);
  } else {
    // ── insert path: COPY directly into target tables ──────────────────────
    await Promise.all([
      copyInsert<TermRow>({
        pool,
        table: 'terms',
        columns: [...TERM_COLS],
        rows: termRows,
      }),
      copyInsert<TagRow>({
        pool,
        table: 'tags',
        columns: [...TAG_COLS],
        rows: tagRows,
      }),
    ]);

    await Promise.all([
      copyInsert<TermTranslationRow>({
        pool,
        table: 'term_translations',
        columns: [...TERM_TRANSLATION_COLS],
        rows: termTranslationRows,
      }),
      copyInsert<TagTranslationRow>({
        pool,
        table: 'tag_translations',
        columns: [...TAG_TRANSLATION_COLS],
        rows: tagTranslationRows,
      }),
      copyInsert<TermTagRow>({
        pool,
        table: 'term_tags',
        columns: [...TERM_TAG_COLS],
        rows: termTagRows,
      }),
    ]);
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

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
