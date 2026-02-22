import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Creates a typed Supabase client for client-side use (anon key, RLS enforced).
 */
export function createClient(
  supabaseUrl: string,
  supabaseKey: string
) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Creates a typed Supabase client for server-side use (service_role key, bypasses RLS).
 * Never expose this client or key to the browser.
 */
export function createServiceClient(
  supabaseUrl: string,
  serviceRoleKey: string
) {
  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type { Database };
export type TypedSupabaseClient = ReturnType<typeof createClient>;
