import { createClient, createServiceClient } from "@tenis/db";
import type { Context } from "./trpc";

/**
 * Creates the tRPC context from an incoming HTTP Request.
 * Uses the service_role client for DB operations (bypasses RLS — authorization
 * is enforced by tRPC middleware instead). Falls back to anon key if service_role
 * is not configured.
 */
export async function createContext(req: Request): Promise<Context> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Server-side: use service_role to bypass RLS (our tRPC middleware enforces auth).
  // If service_role is not set, fall back to anon key for local dev.
  const supabase = serviceRoleKey
    ? createServiceClient(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, supabaseAnonKey);

  // Extract and verify the user's JWT from the Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let user: Context["user"] = null;

  if (token) {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      user = {
        id: data.user.id,
        email: data.user.email,
      };
    }
  }

  return { supabase, user };
}
