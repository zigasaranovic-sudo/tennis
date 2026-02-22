import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  UpdateProfileSchema,
  SearchPlayersSchema,
  AvailabilitySlotSchema,
} from "@tenis/types";

export const playerRouter = router({
  /** Get the authenticated user's full profile */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single();

    if (error || !data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return data;
  }),

  /** Get any player's public profile by their ID */
  getPublicProfile: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("id", input.id)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      return data;
    }),

  /** Get public profile by username */
  getPublicProfileByUsername: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("username", input.username)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      return data;
    }),

  /** Update the authenticated user's profile */
  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check username uniqueness if changing
      if (input.username) {
        const { data: existing } = await ctx.supabase
          .from("profiles")
          .select("id")
          .eq("username", input.username)
          .neq("id", ctx.user.id)
          .single();

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username is already taken",
          });
        }
      }

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update(input)
        .eq("id", ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** Returns a signed upload URL for the player's avatar */
  getAvatarUploadUrl: protectedProcedure
    .input(z.object({ fileExtension: z.enum(["jpg", "jpeg", "png", "webp"]) }))
    .mutation(async ({ ctx, input }) => {
      const path = `${ctx.user.id}/avatar.${input.fileExtension}`;
      const { data, error } = await ctx.supabase.storage
        .from("avatars")
        .createSignedUploadUrl(path);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      const { data: urlData } = ctx.supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      return {
        signedUrl: data.signedUrl,
        token: data.token,
        path: data.path,
        publicUrl: urlData.publicUrl,
      };
    }),

  /**
   * Search for players with optional filters.
   * Uses cursor-based pagination for stable results.
   */
  searchPlayers: protectedProcedure
    .input(SearchPlayersSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, skill_level, matches_played, city, home_club")
        .eq("is_public", true)
        .eq("is_active", true)
        .neq("id", ctx.user.id)
        .order("full_name", { ascending: true })
        .limit(input.limit);

      if (input.name && input.name.length >= 3) {
        query = query.ilike("full_name", `%${input.name}%`);
      }
      if (input.skill_level) query = query.eq("skill_level", input.skill_level);
      if (input.city) query = query.eq("city", input.city);
      if (input.club) query = query.eq("home_club", input.club);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { players: data };
    }),

  /** Return distinct cities and clubs for filter dropdowns */
  getFilterOptions: protectedProcedure
    .input(z.object({ city: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const base = ctx.supabase
        .from("profiles")
        .eq("is_public", true)
        .eq("is_active", true)
        .neq("id", ctx.user.id);

      const { data: cityData } = await (base as typeof base)
        .select("city")
        .not("city", "is", null);
      const cities = [...new Set((cityData ?? []).map((p) => p.city).filter(Boolean))].sort() as string[];

      let clubQuery = (base as typeof base).select("home_club, city").not("home_club", "is", null);
      if (input.city) clubQuery = clubQuery.eq("city", input.city);
      const { data: clubData } = await clubQuery;
      const clubs = [...new Set((clubData ?? []).map((p) => p.home_club).filter(Boolean))].sort() as string[];

      return { cities, clubs };
    }),

  /** Set/replace the player's weekly availability slots */
  setAvailability: protectedProcedure
    .input(z.object({ slots: z.array(AvailabilitySlotSchema) }))
    .mutation(async ({ ctx, input }) => {
      // Delete existing slots and replace with new ones atomically
      const { error: deleteError } = await ctx.supabase
        .from("player_availability")
        .delete()
        .eq("player_id", ctx.user.id);

      if (deleteError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: deleteError.message });
      }

      if (input.slots.length === 0) return { slots: [] };

      const { data, error } = await ctx.supabase
        .from("player_availability")
        .insert(
          input.slots.map((slot) => ({
            player_id: ctx.user.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_recurring: slot.is_recurring,
          }))
        )
        .select();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { slots: data };
    }),

  /** Get availability for any player */
  getAvailability: protectedProcedure
    .input(z.object({ player_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("player_availability")
        .select("*")
        .eq("player_id", input.player_id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** Paginated match history for any player */
  getMatchHistory: protectedProcedure
    .input(
      z.object({
        player_id: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("matches")
        .select(`
          id, status, format, played_at, scheduled_at,
          location_name, location_city,
          player1_sets_won, player2_sets_won, score_detail,
          winner_id, player1_elo_delta, player2_elo_delta,
          player1:player1_id(id, username, full_name, avatar_url, elo_rating),
          player2:player2_id(id, username, full_name, avatar_url, elo_rating)
        `)
        .or(`player1_id.eq.${input.player_id},player2_id.eq.${input.player_id}`)
        .eq("status", "completed")
        .order("played_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** ELO history for charting */
  getEloHistory: protectedProcedure
    .input(
      z.object({
        player_id: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("elo_history")
        .select("*")
        .eq("player_id", input.player_id)
        .order("recorded_at", { ascending: true })
        .limit(input.limit);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),
});
