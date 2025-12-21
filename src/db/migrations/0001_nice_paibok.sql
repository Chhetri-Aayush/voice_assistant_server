CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_name" varchar(255) NOT NULL,
	"patient_name" varchar(255) NOT NULL,
	"appointment_date" date,
	"appointment_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
