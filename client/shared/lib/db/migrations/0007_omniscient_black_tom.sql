CREATE TABLE "saved_book_term" (
	"saved_book_id" text NOT NULL,
	"saved_term_id" text NOT NULL,
	CONSTRAINT "saved_book_term_saved_book_id_saved_term_id_pk" PRIMARY KEY("saved_book_id","saved_term_id")
);
--> statement-breakpoint
DROP TABLE "saved_term_book" CASCADE;--> statement-breakpoint
ALTER TABLE "saved_book_term" ADD CONSTRAINT "saved_book_term_saved_book_id_saved_book_id_fk" FOREIGN KEY ("saved_book_id") REFERENCES "public"."saved_book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_book_term" ADD CONSTRAINT "saved_book_term_saved_term_id_saved_term_id_fk" FOREIGN KEY ("saved_term_id") REFERENCES "public"."saved_term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_saved_book_term_saved_book_id" ON "saved_book_term" USING btree ("saved_book_id");