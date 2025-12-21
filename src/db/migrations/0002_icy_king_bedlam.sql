ALTER TABLE "appointments" ALTER COLUMN "appointment_date" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_time" SET DATA TYPE varchar(10);