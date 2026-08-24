ALTER TABLE "saved_term" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_term" ADD COLUMN "text" text NOT NULL;--> statement-breakpoint
ALTER TABLE "review_card" DROP COLUMN "review_text";