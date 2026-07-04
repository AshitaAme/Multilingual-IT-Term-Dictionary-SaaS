CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "idx_tag_translation_name_trgm" ON "tag_translation" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_term_translation_name_trgm" ON "term_translation" USING gin ("name" gin_trgm_ops);