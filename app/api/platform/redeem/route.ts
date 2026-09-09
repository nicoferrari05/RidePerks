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
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const parsed = uuidSchema.safeParse(body?.token);
  if (!parsed.success)
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  try {
    await rateLimit("redeem:" + profile.id, 60, 600);
    const { data, error } = await getSupabaseAdmin().rpc("rp_redeem_token", {
      p_owner: profile.id,
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
