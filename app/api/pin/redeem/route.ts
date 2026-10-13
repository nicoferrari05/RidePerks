import { NextRequest, NextResponse } from "next/server";
import { pinBusiness, rateLimit, resolveQrToken } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
// Redemption from a device signed in with a business PIN (on-site staff
// without an account). No preview step: scanning registers the use at once.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  const business = await pinBusiness();
  if (!business)
    return NextResponse.json(
      { error: "El PIN ya no es válido. Ingrésalo de nuevo." },
      { status: 401 },
    );
  try {
    await rateLimit("pin-redeem:" + business.id, 120, 600);
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
  const { data, error } = await getSupabaseAdmin().rpc("rp_redeem_token_pin", {
    p_business: business.id,
    p_version: business.version,
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
}
