// ─── columns ───────────────────────────

export const TERM_COLS = ['id', 'slug', 'created_by'] as const;
export const TAG_COLS = ['id', 'slug', 'color'] as const;
export const TERM_TRANSLATION_COLS = [
  'term_id',
  'language_code',
  'name',
  'definition',
  'created_by',
] as const;
export const TAG_TRANSLATION_COLS = [
  'tag_id',
  'language_code',
  'name',
] as const;
export const TERM_TAG_COLS = ['term_id', 'tag_id'] as const;

// ─── types for CSV rows ────────────────────────
export interface TermRow {
  id: string;
  slug: string;
  created_by: string;
}
export interface TagRow {
  id: string;
  slug: string;
  color: string;
}
export interface TermTranslationRow {
  term_id: string;
  language_code: string;
  name: string;
  definition?: string;
  created_by: string;
}
export interface TagTranslationRow {
  tag_id: string;
  language_code: string;
  name: string;
}
export interface TermTagRow {
  term_id: string;
  tag_id: string;
}
