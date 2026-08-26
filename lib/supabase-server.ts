import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client, authenticated with the service role key.
// Never import this from a "use client" component — the service role key
// must never reach the browser. All waitlist reads/writes go through the
// Next.js API routes (app/api/**), which run on the server.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Revisa tu .env.local (ver .env.local.example)."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
