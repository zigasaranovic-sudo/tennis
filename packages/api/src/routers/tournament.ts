import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

/** Creator profile joined to a tournament row */
type TournamentWithCreator = {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  location_city: string | null;
  location_name: string | null;
  scheduled_at: string;
  max_spots: number;
  format: "singles" | "doubles" | "both";
  status: "open" | "full" | "cancelled" | "completed";
  created_at: string;
  creator: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  participant_count: number;
};

/** Participant row with player profile */
type ParticipantWithPlayer = {
  id: string;
  tournament_id: string;
  player_id: string;
  play_format: "singles" | "doubles";
  joined_at: string;
  player: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

export const tournamentRouter = router({
  /** List open/upcoming tournaments with creator info and participant count */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "full", "cancelled", "completed"]).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: tournaments, error } = await ctx.supabase
        .from("tournaments")
        .select(`
          *,
          creator:creator_id(id, full_name, username, avatar_url)
        `)
        .order("scheduled_at", { ascending: true })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      // Fetch participant counts for all returned tournaments
      const ids = (tournaments ?? []).map((t) => t.id);
      let countMap: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: counts } = await ctx.supabase
          .from("tournament_participants")
          .select("tournament_id")
          .in("tournament_id", ids);
        for (const row of counts ?? []) {
          countMap[row.tournament_id] = (countMap[row.tournament_id] ?? 0) + 1;
        }
      }

      const result = (tournaments ?? []).map((t) => ({
        ...(t as unknown as TournamentWithCreator),
        participant_count: countMap[t.id] ?? 0,
      }));

      return result;
    }),

  /** Get a single tournament with participants */
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: tournament, error } = await ctx.supabase
        .from("tournaments")
        .select(`
          *,
          creator:creator_id(id, full_name, username, avatar_url)
        `)
        .eq("id", input.id)
        .single();

      if (error || !tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }

      const { data: participants } = await ctx.supabase
        .from("tournament_participants")
        .select(`
          *,
          player:player_id(id, full_name, username, avatar_url)
        `)
        .eq("tournament_id", input.id)
        .order("joined_at", { ascending: true });

      return {
        ...(tournament as unknown as TournamentWithCreator),
        participant_count: (participants ?? []).length,
        participants: (participants ?? []) as unknown as ParticipantWithPlayer[],
      };
    }),

  /** Create a new tournament */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        location_city: z.string().max(100).optional(),
        location_name: z.string().max(200).optional(),
        scheduled_at: z.string().datetime(),
        max_spots: z.number().int().min(2).max(64).default(8),
        format: z.enum(["singles", "doubles", "both"]).default("singles"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("tournaments")
        .insert({
          creator_id: ctx.user.id,
          name: input.name,
          description: input.description ?? null,
          location_city: input.location_city ?? null,
          location_name: input.location_name ?? null,
          scheduled_at: input.scheduled_at,
          max_spots: input.max_spots,
          format: input.format,
        })
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error?.message ?? "Failed to create tournament" });
      }

      return data;
    }),

  /** Join a tournament */
  join: protectedProcedure
    .input(
      z.object({
        tournament_id: z.string().uuid(),
        play_format: z.enum(["singles", "doubles"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the tournament to check status and spots
      const { data: tournament } = await ctx.supabase
        .from("tournaments")
        .select("id, status, max_spots, format, creator_id")
        .eq("id", input.tournament_id)
        .single();

      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      if (tournament.status !== "open") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tournament is not open for joining" });
      }
      if (tournament.creator_id === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot join your own tournament as a participant" });
      }

      // Check if already joined
      const { data: existing } = await ctx.supabase
        .from("tournament_participants")
        .select("id")
        .eq("tournament_id", input.tournament_id)
        .eq("player_id", ctx.user.id)
        .single();

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You have already joined this tournament" });
      }

      // Count current participants
      const { count } = await ctx.supabase
        .from("tournament_participants")
        .select("id", { count: "exact", head: true })
        .eq("tournament_id", input.tournament_id);

      if ((count ?? 0) >= tournament.max_spots) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tournament is full" });
      }

      // Insert participant
      const { data, error } = await ctx.supabase
        .from("tournament_participants")
        .insert({
          tournament_id: input.tournament_id,
          player_id: ctx.user.id,
          play_format: input.play_format,
        })
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error?.message ?? "Failed to join tournament" });
      }

      // If now full, update tournament status
      const newCount = (count ?? 0) + 1;
      if (newCount >= tournament.max_spots) {
        await ctx.supabase
          .from("tournaments")
          .update({ status: "full" })
          .eq("id", input.tournament_id);
      }

      return data;
    }),

  /** Cancel a tournament (creator only) */
  cancel: protectedProcedure
    .input(z.object({ tournament_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("tournaments")
        .update({ status: "cancelled" })
        .eq("id", input.tournament_id)
        .eq("creator_id", ctx.user.id)
        .in("status", ["open", "full"])
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tournament not found or you are not the creator",
        });
      }

      return data;
    }),
});
