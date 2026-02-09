ALTER TABLE "appointments" ADD COLUMN "date" text NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "department" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "doctor" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "doctor_name";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "patient_name";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "appointment_date";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "appointment_time";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "created_at";