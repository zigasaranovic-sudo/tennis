import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  GetVenuesSchema,
  GetVenueSchema,
  GetCourtAvailabilitySchema,
  BookCourtSchema,
  CancelBookingSchema,
  GetMyBookingsSchema,
} from "@tenis/types";

export const courtsRouter = router({
  /** List venues with optional city/country filter */
  getVenues: protectedProcedure
    .input(GetVenuesSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("venues")
        .select("id, name, city, country, address, surfaces, is_active")
        .eq("is_active", true)
        .order("city")
        .order("name");

      if (input.city) query = query.ilike("city", `%${input.city}%`);
      if (input.country) query = query.eq("country", input.country.toUpperCase());

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return data ?? [];
    }),

  /** Get a single venue with its courts */
  getVenue: protectedProcedure
    .input(GetVenueSchema)
    .query(async ({ ctx, input }) => {
      const { data: venue, error } = await ctx.supabase
        .from("venues")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !venue) throw new TRPCError({ code: "NOT_FOUND", message: "Venue not found" });

      const { data: courts } = await ctx.supabase
        .from("courts")
        .select("*")
        .eq("venue_id", input.id)
        .eq("is_active", true)
        .order("name");

      return { ...venue, courts: courts ?? [] };
    }),

  /** Get bookings for a court on a specific date */
  getCourtAvailability: protectedProcedure
    .input(GetCourtAvailabilitySchema)
    .query(async ({ ctx, input }) => {
      const dayStart = `${input.date}T00:00:00.000Z`;
      const dayEnd = `${input.date}T23:59:59.999Z`;

      const { data, error } = await ctx.supabase
        .from("court_bookings")
        .select("id, starts_at, ends_at, booked_by, status")
        .eq("court_id", input.court_id)
        .eq("status", "confirmed")
        .gte("starts_at", dayStart)
        .lte("starts_at", dayEnd)
        .order("starts_at");

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return data ?? [];
    }),

  /** Book a court — validates no overlap */
  bookCourt: protectedProcedure
    .input(BookCourtSchema)
    .mutation(async ({ ctx, input }) => {
      // Check for overlapping confirmed bookings
      const { data: conflicts } = await ctx.supabase
        .from("court_bookings")
        .select("id")
        .eq("court_id", input.court_id)
        .eq("status", "confirmed")
        .lt("starts_at", input.ends_at)
        .gt("ends_at", input.starts_at);

      if (conflicts && conflicts.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Court already booked for that time" });
      }

      const { data, error } = await ctx.supabase
        .from("court_bookings")
        .insert({
          court_id: input.court_id,
          booked_by: ctx.user.id,
          match_id: input.match_id ?? null,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          notes: input.notes ?? null,
        })
        .select("*")
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error?.message ?? "Failed to book" });
      }

      return data;
    }),

  /** Get the current user's bookings */
  getMyBookings: protectedProcedure
    .input(GetMyBookingsSchema)
    .query(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      let query = ctx.supabase
        .from("court_bookings")
        .select(
          "id, starts_at, ends_at, status, notes, match_id, court_id, court:court_id(id, name, surface, is_indoor, venue:venue_id(id, name, city))"
        )
        .eq("booked_by", ctx.user.id)
        .order("starts_at", { ascending: input.upcoming });

      if (input.upcoming) {
        query = query.gte("starts_at", now).eq("status", "confirmed");
      } else {
        query = query.lt("starts_at", now);
      }

      const { data, error } = await query.limit(50);
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return data ?? [];
    }),

  /** Cancel a booking */
  cancelBooking: protectedProcedure
    .input(CancelBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: booking } = await ctx.supabase
        .from("court_bookings")
        .select("id, booked_by, starts_at")
        .eq("id", input.booking_id)
        .single();

      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      if (booking.booked_by !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your booking" });
      }
      if (new Date(booking.starts_at) < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel a past booking" });
      }

      const { error } = await ctx.supabase
        .from("court_bookings")
        .update({ status: "cancelled" })
        .eq("id", input.booking_id);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return { ok: true };
    }),
});
