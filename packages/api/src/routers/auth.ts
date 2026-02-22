import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { RegisterSchema } from "@tenis/types";

export const authRouter = router({
  /** Get the current user's session info */
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /** Register a new player account */
  signUpWithEmail: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name,
            username: input.username,
          },
        },
      });

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      // Update the auto-created profile with the extra fields from registration
      if (data.user) {
        await ctx.supabase
          .from("profiles")
          .update({
            skill_level: input.skill_level,
            city: input.city ?? null,
            country: input.country,
          })
          .eq("id", data.user.id);
      }

      return { user: data.user, session: data.session };
    }),

  /** Sign in with email and password */
  signInWithEmail: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      return { user: data.user, session: data.session };
    }),

  /** Get OAuth sign-in URL (Google or Apple) */
  signInWithOAuth: publicProcedure
    .input(
      z.object({
        provider: z.enum(["google", "apple"]),
        redirectTo: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithOAuth({
        provider: input.provider,
        options: { redirectTo: input.redirectTo },
      });

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      return { url: data.url };
    }),

  /** Sign out the current user */
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();
    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    return { success: true };
  }),

  /** Change password */
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.updateUser({
        password: input.newPassword,
      });

      if (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }

      return { success: true };
    }),
});
