import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import {
  SendMatchRequestSchema,
  RespondToRequestSchema,
  SubmitResultSchema,
} from "@tenis/types";

export const matchRouter = router({
  /** Send a match request to another player */
  sendRequest: protectedProcedure
    .input(SendMatchRequestSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.recipient_id === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot send a match request to yourself",
        });
      }

      // Verify recipient exists and is public
      const { data: recipient } = await ctx.supabase
        .from("profiles")
        .select("id")
        .eq("id", input.recipient_id)
        .eq("is_public", true)
        .single();

      if (!recipient) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      // Prevent duplicate pending requests
      const { data: existingRequest } = await ctx.supabase
        .from("match_requests")
        .select("id")
        .eq("requester_id", ctx.user.id)
        .eq("recipient_id", input.recipient_id)
        .eq("status", "pending")
        .single();

      if (existingRequest) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending request with this player",
        });
      }

      const { data, error } = await ctx.supabase
        .from("match_requests")
        .insert({
          requester_id: ctx.user.id,
          recipient_id: input.recipient_id,
          proposed_at: input.proposed_at,
          proposed_format: input.format,
          location_name: input.location_name ?? null,
          location_city: input.location_city ?? null,
          message: input.message ?? null,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** Get all match requests (incoming + outgoing) for the current user */
  getRequests: protectedProcedure
    .input(
      z.object({
        type: z.enum(["incoming", "outgoing", "all"]).default("all"),
        status: z
          .enum(["pending", "accepted", "declined", "expired", "withdrawn"])
          .optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("match_requests")
        .select(`
          *,
          requester:requester_id(id, username, full_name, avatar_url, elo_rating, skill_level),
          recipient:recipient_id(id, username, full_name, avatar_url, elo_rating, skill_level)
        `)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.type === "incoming") {
        query = query.eq("recipient_id", ctx.user.id);
      } else if (input.type === "outgoing") {
        query = query.eq("requester_id", ctx.user.id);
      } else {
        query = query.or(
          `requester_id.eq.${ctx.user.id},recipient_id.eq.${ctx.user.id}`
        );
      }

      if (input.status) {
        query = query.eq("status", input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** Accept or decline a match request */
  respondToRequest: protectedProcedure
    .input(RespondToRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is the recipient
      const { data: request, error: fetchError } = await ctx.supabase
        .from("match_requests")
        .select("*")
        .eq("id", input.request_id)
        .eq("recipient_id", ctx.user.id)
        .eq("status", "pending")
        .single();

      if (fetchError || !request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match request not found or already responded to",
        });
      }

      if (input.response === "declined") {
        const { data, error } = await ctx.supabase
          .from("match_requests")
          .update({ status: "declined" })
          .eq("id", input.request_id)
          .select()
          .single();

        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
        return { request: data, match: null };
      }

      // Accept: create the match and link it
      const { data: match, error: matchError } = await ctx.supabase
        .from("matches")
        .insert({
          player1_id: request.requester_id,
          player2_id: request.recipient_id,
          status: "accepted",
          format: request.proposed_format,
          scheduled_at: request.proposed_at,
          location_name: request.location_name,
          location_city: request.location_city,
          is_ranked: true,
        })
        .select()
        .single();

      if (matchError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: matchError.message });
      }

      // Update request: accepted + linked to new match
      const { data: updatedRequest, error: updateError } = await ctx.supabase
        .from("match_requests")
        .update({ status: "accepted", match_id: match.id })
        .eq("id", input.request_id)
        .select()
        .single();

      if (updateError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: updateError.message });
      }

      return { request: updatedRequest, match };
    }),

  /** Requester cancels their pending request */
  withdrawRequest: protectedProcedure
    .input(z.object({ request_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("match_requests")
        .update({ status: "withdrawn" })
        .eq("id", input.request_id)
        .eq("requester_id", ctx.user.id)
        .eq("status", "pending")
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found or cannot be withdrawn",
        });
      }

      return data;
    }),

  /** Get a single match by ID */
  getMatch: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("matches")
        .select(`
          *,
          player1:player1_id(id, username, full_name, avatar_url, elo_rating),
          player2:player2_id(id, username, full_name, avatar_url, elo_rating)
        `)
        .eq("id", input.id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .single();

      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }

      return data;
    }),

  /** Get the current user's matches with filters */
  getMyMatches: protectedProcedure
    .input(
      z.object({
        status: z.enum(["accepted", "pending_confirmation", "completed", "cancelled"]).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("matches")
        .select(`
          *,
          player1:player1_id(id, username, full_name, avatar_url, elo_rating),
          player2:player2_id(id, username, full_name, avatar_url, elo_rating)
        `)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.status) {
        query = query.eq("status", input.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /**
   * Submit match result (first player to report).
   * Moves match to 'pending_confirmation' until the other player confirms.
   */
  submitResult: protectedProcedure
    .input(SubmitResultSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: match, error: fetchError } = await ctx.supabase
        .from("matches")
        .select("*")
        .eq("id", input.match_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .single();

      if (fetchError || !match) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }

      if (match.status !== "accepted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot submit result for a match with status: ${match.status}`,
        });
      }

      // Determine sets won from score_detail
      const score = input.score_detail;
      let p1Sets = 0;
      let p2Sets = 0;
      for (const set of score) {
        if (set.p1 > set.p2) p1Sets++;
        else p2Sets++;
      }

      const { data, error } = await ctx.supabase
        .from("matches")
        .update({
          status: "pending_confirmation",
          score_detail: score,
          player1_sets_won: p1Sets,
          player2_sets_won: p2Sets,
          result_submitted_by: ctx.user.id,
          played_at: new Date().toISOString(),
        })
        .eq("id", input.match_id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /**
   * Confirm the match result (the other player verifies the score).
   * Triggers the ELO calculation via Supabase Edge Function.
   */
  confirmResult: protectedProcedure
    .input(z.object({ match_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: match, error: fetchError } = await ctx.supabase
        .from("matches")
        .select("*")
        .eq("id", input.match_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .single();

      if (fetchError || !match) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }

      if (match.status !== "pending_confirmation") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Match result is not awaiting confirmation",
        });
      }

      if (match.result_submitted_by === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot confirm your own result submission",
        });
      }

      // Update confirmed_by fields — the Edge Function 'process_match_result'
      // will handle ELO calculation and final status update atomically
      const { data, error } = await ctx.supabase
        .from("matches")
        .update({
          result_confirmed_by: ctx.user.id,
          result_confirmed_at: new Date().toISOString(),
        })
        .eq("id", input.match_id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      // Invoke Edge Function to process ELO and finalize match
      await ctx.supabase.functions.invoke("match-result", {
        body: { matchId: input.match_id },
      });

      return data;
    }),

  /** Flag a result as disputed — sends to admin review */
  disputeResult: protectedProcedure
    .input(
      z.object({
        match_id: z.string().uuid(),
        reason: z.string().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("matches")
        .update({ status: "disputed", notes: input.reason })
        .eq("id", input.match_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .eq("status", "pending_confirmation")
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found or cannot be disputed",
        });
      }

      return data;
    }),

  /** Cancel an accepted match before it is played */
  cancelMatch: protectedProcedure
    .input(z.object({ match_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("matches")
        .update({ status: "cancelled" })
        .eq("id", input.match_id)
        .or(`player1_id.eq.${ctx.user.id},player2_id.eq.${ctx.user.id}`)
        .eq("status", "accepted")
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Match not found or cannot be cancelled",
        });
      }

      return data;
    }),
});
