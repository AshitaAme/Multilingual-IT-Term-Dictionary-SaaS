import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  unique,
  real,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './user-schema';

// ========== Language ==========
export const languages = pgTable('language', {
  code: text('code').primaryKey(),
  name: text('name').notNull(), // name of language
  isDefault: boolean('is_default').default(false).notNull(),
});

// ========== Term ==========
export const termStatusEnum = pgEnum('term_status', ['draft', 'published']);

export const terms = pgTable('term', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  status: termStatusEnum('status').default('published').notNull(),
  createdBy: text('created_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const termTranslations = pgTable(
  'term_translation',
  {
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
    languageCode: text('language_code')
      .notNull()
      .references(() => languages.code, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    definition: text('definition'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    createdBy: text('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [
    primaryKey({ columns: [t.termId, t.languageCode] }),
    index('idx_term_translation_lang').on(t.languageCode),
    index('idx_term_translation_name').on(t.name),
  ],
);

// ========== Tag ==========
export const tags = pgTable('tag', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  color: text('color'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const tagTranslations = pgTable(
  'tag_translation',
  {
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    languageCode: text('language_code')
      .notNull()
      .references(() => languages.code),
    name: text('name').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tagId, t.languageCode] }),
    index('idx_tag_translation_lang').on(t.languageCode),
  ],
);

export const termTags = pgTable(
  'term_tag',
  {
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.termId, t.tagId] }),
    index('idx_term_tag_tag_id').on(t.tagId),
  ],
);

// ========== Saved Term ==========
export const savedTerms = pgTable(
  'saved_term',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.termId),
    index('idx_saved_term_user_id').on(t.userId),
  ],
);

// ========== Review Card (FSRS) ==========
export const reviewCards = pgTable(
  'review_card',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),

    // --- FSRS core fields ---
    stability: real('stability').default(0).notNull(), // memory stability in days (S)
    difficulty: real('difficulty').default(5).notNull(), // item difficulty 1~10 (D)

    // --- scheduling ---
    state: text('state').default('new').notNull(), // 'new' | 'learning' | 'review' | 'relearning'
    step: integer('step').default(0).notNull(), // current step index within learning/relearning phase
    nextReviewAt: timestamp('next_review_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    lastReviewAt: timestamp('last_review_at', { mode: 'date' }),

    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.termId),
    index('idx_review_card_user_next_review').on(t.userId, t.nextReviewAt),
  ],
);

export const reviewLogs = pgTable(
  'review_log',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    termId: text('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
    reviewCardId: text('review_card_id')
      .notNull()
      .references(() => reviewCards.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    stabilityAfter: real('stability_after').notNull(),
    difficultyAfter: real('difficulty_after').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('idx_review_log_card_id').on(t.reviewCardId),
    index('idx_review_log_user_created').on(t.userId, t.createdAt),
  ],
);
