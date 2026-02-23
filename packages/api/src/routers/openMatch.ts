import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { OpenMatchCreateSchema, SkillLevelSchema } from "@tenis/types";

type CreatorProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  skill_level: string | null;
};

type OpenMatchWithCreator = {
  id: string;
  creator_id: string;
  scheduled_at: string;
  location_city: string | null;
  location_name: string | null;
  skill_min: string | null;
  skill_max: string | null;
  format: string;
  message: string | null;
  status: string;
  filled_by: string | null;
  created_at: string;
  creator: CreatorProfile | null;
};

export const openMatchRouter = router({
  /** Post a new open match invitation */
  create: protectedProcedure
    .input(OpenMatchCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("open_matches")
        .insert({
          creator_id: ctx.user.id,
          scheduled_at: input.scheduled_at,
          location_city: input.location_city ?? null,
          location_name: input.location_name ?? null,
          skill_min: input.skill_min ?? null,
          skill_max: input.skill_max ?? null,
          format: input.format ?? "best_of_3",
          message: input.message ?? null,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** List open matches available to join */
  list: protectedProcedure
    .input(
      z.object({
        city: z.string().optional(),
        skill_level: SkillLevelSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("open_matches")
        .select(
          `*, creator:creator_id(id, full_name, username, avatar_url, skill_level)`
        )
        .eq("status", "open")
        .gt("scheduled_at", new Date().toISOString())
        .neq("creator_id", ctx.user.id)
        .order("scheduled_at", { ascending: true })
        .limit(input.limit);

      if (input.city) {
        query = query.eq("location_city", input.city);
      }

      if (input.skill_level) {
        // Show open matches where skill range includes the user's level, or no skill restriction
        query = query.or(
          `skill_min.is.null,skill_min.eq.${input.skill_level}`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return (data ?? []) as unknown as OpenMatchWithCreator[];
    }),

  /** Join an open match — sets it as filled and creates a match request */
  join: protectedProcedure
    .input(z.object({ open_match_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch the open match
      const { data: openMatch, error: fetchError } = await ctx.supabase
        .from("open_matches")
        .select("*")
        .eq("id", input.open_match_id)
        .eq("status", "open")
        .single();

      if (fetchError || !openMatch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Open match not found or already filled",
        });
      }

      if (openMatch.creator_id === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot join your own open match",
        });
      }

      // Mark the open match as filled
      const { error: updateError } = await ctx.supabase
        .from("open_matches")
        .update({ status: "filled", filled_by: ctx.user.id })
        .eq("id", input.open_match_id)
        .eq("status", "open");

      if (updateError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: updateError.message });
      }

      // Create a match request from creator → joiner
      const { data: request, error: requestError } = await ctx.supabase
        .from("match_requests")
        .insert({
          requester_id: openMatch.creator_id,
          recipient_id: ctx.user.id,
          proposed_at: openMatch.scheduled_at,
          proposed_format: openMatch.format as "best_of_1" | "best_of_3" | "best_of_5",
          location_name: openMatch.location_name ?? null,
          location_city: openMatch.location_city ?? null,
          message: openMatch.message ?? null,
        })
        .select()
        .single();

      if (requestError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: requestError.message });
      }

      return request;
    }),
});
