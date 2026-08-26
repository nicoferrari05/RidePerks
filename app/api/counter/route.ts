import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public, unauthenticated endpoint the landing page polls once on load.
// Read-only, and only ever exposes a boolean + a count — never PII.
export async function GET() {
  const supabase = getSupabaseAdmin();

  const [settingRes, countRes] = await Promise.all([
    supabase.from("app_settings").select("value").eq("key", "show_counter").maybeSingle(),
    supabase.from("waitlist").select("id", { count: "exact", head: true }),
  ]);

  const visible = settingRes.data?.value === true;

  return NextResponse.json(
    {
      visible,
      count: countRes.count ?? 0,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
