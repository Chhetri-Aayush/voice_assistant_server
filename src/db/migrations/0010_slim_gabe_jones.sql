CREATE TABLE "faq_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" vector(768) NOT NULL
);
