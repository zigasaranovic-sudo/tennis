import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Scheduled Edge Function — expires stale match requests.
 * Schedule with pg_cron or via Supabase Scheduled Functions (every 15 minutes).
 *
 * To schedule via Supabase Dashboard:
 *   Project Settings → Edge Functions → Schedule
 *   Cron: "*/15 * * * *"
 */
serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.rpc("expire_match_requests");

  if (error) {
    console.error("expire_match_requests error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const expiredCount = data as number;
  console.log(`Expired ${expiredCount} match requests`);

  return new Response(
    JSON.stringify({ success: true, expired: expiredCount }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
