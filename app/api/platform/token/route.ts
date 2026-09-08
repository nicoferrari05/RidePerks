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
  if (!profile || profile.role !== "driver")
    return NextResponse.json(
      { error: "Inicia sesión para continuar." },
      { status: 401 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const id = uuidSchema.safeParse(body?.benefit_id);
  if (!id.success)
    return NextResponse.json({ error: "Beneficio inválido." }, { status: 400 });
  try {
    await rateLimit("token:" + profile.id, 30, 600);
    const { data, error } = await getSupabaseAdmin().rpc("rp_issue_token", {
      p_driver: profile.id,
      p_benefit: id.data,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            error.code === "P0001"
              ? error.message
              : "No pudimos generar el código.",
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
export async function GET(request: NextRequest) {
  const profile = await currentProfile();
  if (!profile)
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const parsed = uuidSchema.safeParse(
    request.nextUrl.searchParams.get("token"),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  const { data, error } = await getSupabaseAdmin()
    .from("rp_qr_tokens")
    .select("status,expires_at")
    .eq("token", parsed.data)
    .eq("driver_id", profile.id)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { error: "No pudimos consultar el código." },
      { status: 503 },
    );
  if (!data)
    return NextResponse.json(
      { error: "Código no encontrado." },
      { status: 404 },
    );
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
