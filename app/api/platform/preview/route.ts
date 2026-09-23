import { NextRequest, NextResponse } from "next/server";
import { currentProfile, rateLimit } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { uuidSchema } from "@/lib/platform/validation";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  const profile = await currentProfile();
  if (!profile || profile.role !== "business" || profile.status === "suspended")
    return NextResponse.json(
      { error: "Inicia sesión como comercio." },
      { status: 401 },
    );
  try {
    await rateLimit("preview:" + profile.id, 240, 600);
  } catch {
    return NextResponse.json(
      {
        error: "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
      },
      { status: 429 },
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  // Accepts either the full token (from the QR/camera) or the six-character
  // fallback code a driver can read out loud / type by hand. The redeem
  // transaction itself (rp_redeem_token) only ever sees a real token uuid —
  // this is a plain, read-only lookup ahead of it, not a security boundary.
  const raw = typeof body?.token === "string" ? body.token.trim() : "";
  let tokenValue: string = raw;
  if (!uuidSchema.safeParse(raw).success && /^[0-9a-f]{6}$/i.test(raw)) {
    const resolved = await getSupabaseAdmin()
      .from("rp_qr_tokens")
      .select("token")
      .eq("short_code", raw.toUpperCase())
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (resolved.data) tokenValue = resolved.data.token;
  }
  const parsed = uuidSchema.safeParse(tokenValue);
  if (!parsed.success)
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdmin().rpc("rp_preview_token", {
      p_actor: profile.id,
      p_token: parsed.data,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            error.code === "P0001"
              ? error.message
              : "No pudimos registrar el uso.",
        },
        { status: 400 },
      );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Intenta nuevamente." },
      { status: 429 },
    );
  }
}
