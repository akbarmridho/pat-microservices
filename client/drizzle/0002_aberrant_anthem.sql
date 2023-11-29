ALTER TABLE "bookings" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "seat_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "ticket_booking_id" integer;