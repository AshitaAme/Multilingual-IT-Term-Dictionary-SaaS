CREATE TABLE "saved_term_book" (
	"saved_book_id" text NOT NULL,
	"saved_term_id" text NOT NULL,
	CONSTRAINT "saved_term_book_saved_book_id_saved_term_id_pk" PRIMARY KEY("saved_book_id","saved_term_id")
);
--> statement-breakpoint
ALTER TABLE "saved_book" DROP CONSTRAINT "saved_book_saved_term_id_saved_term_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_book" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_term_book" ADD CONSTRAINT "saved_term_book_saved_book_id_saved_book_id_fk" FOREIGN KEY ("saved_book_id") REFERENCES "public"."saved_book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_term_book" ADD CONSTRAINT "saved_term_book_saved_term_id_saved_term_id_fk" FOREIGN KEY ("saved_term_id") REFERENCES "public"."saved_term"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_saved_book_term_saved_book_id" ON "saved_term_book" USING btree ("saved_book_id");--> statement-breakpoint
ALTER TABLE "saved_book" DROP COLUMN "saved_term_id";--> statement-breakpoint
ALTER TABLE "saved_book" ADD CONSTRAINT "saved_book_name_user_id_unique" UNIQUE("name","user_id");