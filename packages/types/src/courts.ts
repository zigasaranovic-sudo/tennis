import { z } from "zod";

export const GetVenuesSchema = z.object({
  city: z.string().optional(),
  country: z.string().length(2).optional(),
});

export const GetVenueSchema = z.object({
  id: z.string().uuid(),
});

export const GetCourtAvailabilitySchema = z.object({
  court_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const BookCourtSchema = z.object({
  court_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  match_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const CancelBookingSchema = z.object({
  booking_id: z.string().uuid(),
});

export const GetMyBookingsSchema = z.object({
  upcoming: z.boolean().default(true),
});
