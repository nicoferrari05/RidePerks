import { NextRequest, NextResponse } from "next/server";
import {
  currentProfile,
  rateLimit,
  resolveQrToken,
} from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
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
  const token = await resolveQrToken(body?.token);
  if (!token)
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdmin().rpc("rp_preview_token", {
      p_actor: profile.id,
      p_token: token,
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
