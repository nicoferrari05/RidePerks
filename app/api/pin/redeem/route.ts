import { NextRequest, NextResponse } from "next/server";
import { pinBusiness } from "@/lib/platform/data";
import { redeemWithPin } from "@/lib/platform/counter";
import { AppError } from "@/lib/platform/app-api";
// Redemption from a device signed in with a business PIN (on-site staff
// without an account). No preview step: scanning registers the use at once.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  try {
    const business = await pinBusiness();
    if (!business)
      throw new AppError("El PIN ya no es válido. Ingrésalo de nuevo.", 401);
    let body;
    try {
      body = await request.json();
    } catch {
      throw new AppError("Solicitud inválida.", 400);
    }
    return NextResponse.json(await redeemWithPin(business, body.token), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    if (e instanceof AppError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Intenta nuevamente." }, { status: 500 });
  }
}
