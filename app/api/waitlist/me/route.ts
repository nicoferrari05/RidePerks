import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Public lookup for a returning visitor's own queue position, keyed by
// their referral code (stored client-side in localStorage after signup).
// Only ever returns position + referral count — never another person's
// name, email, or phone — so this stays safe to leave unauthenticated.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || code.trim().length === 0) {
    return NextResponse.json({ error: "Falta el código." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("waitlist_ranked")
      .select("position, referral_count")
      .eq("referral_code", code.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("waitlist/me fetch error", error);
      return NextResponse.json({ error: "No pudimos buscar tu posición." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    }

    return NextResponse.json(
      { position: data.position, referralCount: data.referral_count },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("waitlist/me failed", err);
    return NextResponse.json({ error: "No pudimos buscar tu posición." }, { status: 500 });
  }
}
