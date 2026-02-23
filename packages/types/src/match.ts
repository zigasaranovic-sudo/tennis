import { z } from "zod";
import { SkillLevelSchema } from "./user";

export const MatchFormatSchema = z.enum(["best_of_1", "best_of_3", "best_of_5"]);
export type MatchFormat = z.infer<typeof MatchFormatSchema>;

export const MatchStatusSchema = z.enum([
  "pending",
  "accepted",
  "pending_confirmation",
  "completed",
  "cancelled",
  "disputed",
]);
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

export const RequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "expired",
  "withdrawn",
]);
export type RequestStatus = z.infer<typeof RequestStatusSchema>;

/** A single set score e.g. { p1: 6, p2: 4 } */
export const SetScoreSchema = z.object({
  p1: z.number().int().min(0).max(7),
  p2: z.number().int().min(0).max(7),
});
export type SetScore = z.infer<typeof SetScoreSchema>;

/**
 * Validates that score detail is consistent with the match format.
 * Handles tiebreaks (7-6) and advantage sets.
 */
function validateScoreDetail(
  sets: SetScore[],
  format: MatchFormat
): boolean {
  const setsToWin = format === "best_of_1" ? 1 : format === "best_of_3" ? 2 : 3;
  const maxSets = format === "best_of_1" ? 1 : format === "best_of_3" ? 3 : 5;

  if (sets.length < setsToWin || sets.length > maxSets) return false;

  let p1Sets = 0;
  let p2Sets = 0;

  for (const set of sets) {
    // A set winner must have at least 6 games and be ahead by 2, OR win 7-6 (tiebreak)
    const p1Won =
      (set.p1 >= 6 && set.p1 - set.p2 >= 2) || (set.p1 === 7 && set.p2 === 6);
    const p2Won =
      (set.p2 >= 6 && set.p2 - set.p1 >= 2) || (set.p2 === 7 && set.p1 === 6);
    if (!p1Won && !p2Won) return false;
    if (p1Won) p1Sets++;
    if (p2Won) p2Sets++;
  }

  // Match must end as soon as someone has enough sets
  const winner = p1Sets >= setsToWin ? "p1" : p2Sets >= setsToWin ? "p2" : null;
  return winner !== null;
}

export const SubmitResultSchema = z
  .object({
    match_id: z.string().uuid(),
    score_detail: z
      .array(SetScoreSchema)
      .min(1)
      .max(5),
    format: MatchFormatSchema,
  })
  .refine(
    (data) => validateScoreDetail(data.score_detail, data.format),
    {
      message: "Score detail is invalid for the given match format",
      path: ["score_detail"],
    }
  );
export type SubmitResult = z.infer<typeof SubmitResultSchema>;

export const SendMatchRequestSchema = z.object({
  recipient_id: z.string().uuid(),
  proposed_at: z.string().datetime(),
  format: MatchFormatSchema.default("best_of_3"),
  location_name: z.string().max(200).optional(),
  location_city: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});
export type SendMatchRequest = z.infer<typeof SendMatchRequestSchema>;

export const RespondToRequestSchema = z.object({
  request_id: z.string().uuid(),
  response: z.enum(["accepted", "declined"]),
});
export type RespondToRequest = z.infer<typeof RespondToRequestSchema>;

export const GetLeaderboardSchema = z.object({
  country: z.string().length(2).optional(),
  city: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});
export type GetLeaderboard = z.infer<typeof GetLeaderboardSchema>;

export const OpenMatchCreateSchema = z.object({
  scheduled_at: z.string().datetime(),
  location_city: z.string().max(100).optional(),
  location_name: z.string().max(200).optional(),
  skill_min: SkillLevelSchema.optional(),
  skill_max: SkillLevelSchema.optional(),
  format: MatchFormatSchema.optional(),
  message: z.string().max(300).optional(),
});
export type OpenMatchCreate = z.infer<typeof OpenMatchCreateSchema>;
