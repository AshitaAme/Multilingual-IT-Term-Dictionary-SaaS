ALTER TABLE "review_card" RENAME COLUMN "user_id" TO "saved_term_id";--> statement-breakpoint
ALTER TABLE "review_card" DROP CONSTRAINT "review_card_user_id_term_id_unique";--> statement-breakpoint
ALTER TABLE "review_card" DROP CONSTRAINT "review_card_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "review_card" DROP CONSTRAINT "review_card_term_id_term_id_fk";
--> statement-breakpoint
DROP INDEX "idx_review_card_user_next_review";--> statement-breakpoint
ALTER TABLE "review_card" ADD CONSTRAINT "review_card_saved_term_id_saved_term_id_fk" FOREIGN KEY ("saved_term_id") REFERENCES "public"."saved_term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_review_card_saved_term_next_review" ON "review_card" USING btree ("saved_term_id","next_review_at");--> statement-breakpoint
ALTER TABLE "review_card" DROP COLUMN "term_id";