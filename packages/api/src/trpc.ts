import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { TypedSupabaseClient } from "@tenis/db";

export type Context = {
  supabase: TypedSupabaseClient;
  user: {
    id: string;
    email: string | undefined;
  } | null;
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/** Base router factory */
export const router = t.router;

/** Public procedure — no auth required */
export const publicProcedure = t.procedure;

/** Middleware: requires authenticated session */
const enforceAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/** Protected procedure — auth required */
export const protectedProcedure = t.procedure.use(enforceAuthenticated);
