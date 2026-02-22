import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { GetLeaderboardSchema } from "@tenis/types";
import { z } from "zod";

export const rankingRouter = router({
  /** Public leaderboard — paginated, filterable by country/city */
  getLeaderboard: publicProcedure
    .input(GetLeaderboardSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("leaderboard")
        .select("*")
        .order("rank", { ascending: true })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.country) query = query.eq("country", input.country);
      if (input.city) query = query.ilike("city", `%${input.city}%`);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),

  /** Get the authenticated player's current global and country rank */
  getPlayerRank: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("leaderboard")
      .select("rank, country_rank, elo_rating, matches_played")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      // Player may not appear on leaderboard yet (< 5 matches)
      return { rank: null, country_rank: null, elo_rating: null, matches_played: 0 };
    }

    return data;
  }),

  /** Players with the biggest ELO gains in the last 7 days */
  getTopMovers: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const { data, error } = await ctx.supabase
        .from("elo_history")
        .select(`
          player_id,
          elo_delta,
          recorded_at,
          player:player_id(id, username, full_name, avatar_url, elo_rating)
        `)
        .gte("recorded_at", since.toISOString())
        .eq("reason", "match_result")
        .order("elo_delta", { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return data;
    }),
});
