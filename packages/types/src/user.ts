import { z } from "zod";

export const SkillLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "professional",
]);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const PreferredSurfaceSchema = z.enum([
  "clay",
  "hard",
  "grass",
  "indoor",
]);
export type PreferredSurface = z.infer<typeof PreferredSurfaceSchema>;

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores")
    .optional(),
  bio: z.string().max(500).optional(),
  skill_level: SkillLevelSchema.optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  preferred_surface: z.array(PreferredSurfaceSchema).optional(),
  is_public: z.boolean().optional(),
  home_club: z.string().max(100).optional(),
});
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2).max(100),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  skill_level: SkillLevelSchema,
  city: z.string().max(100).optional(),
  country: z.string().length(2).default("US"),
});
export type Register = z.infer<typeof RegisterSchema>;

export const AvailabilitySlotSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  is_recurring: z.boolean().default(true),
});
export type AvailabilitySlot = z.infer<typeof AvailabilitySlotSchema>;

export const SearchPlayersSchema = z.object({
  name: z.string().optional(),
  skill_level: SkillLevelSchema.optional(),
  club: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});
export type SearchPlayers = z.infer<typeof SearchPlayersSchema>;
