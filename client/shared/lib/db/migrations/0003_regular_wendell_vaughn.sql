CREATE TABLE "saved_book" (
	"id" text PRIMARY KEY NOT NULL,
	"saved_term_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_book" ADD CONSTRAINT "saved_book_saved_term_id_saved_term_id_fk" FOREIGN KEY ("saved_term_id") REFERENCES "public"."saved_term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_book" ADD CONSTRAINT "saved_book_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_saved_book_user_id" ON "saved_book" USING btree ("user_id");