import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/platform/data";
import { AppError } from "@/lib/platform/app-api";
import { paymentSummary, startPayment } from "@/lib/payments/membership";
export const runtime = "nodejs";

// The web's Yappy checkout. The rules live in lib/payments/membership.ts,
// shared with the phone app.
const noStore = { "Cache-Control": "private, no-store" };

function failure(e: unknown) {
  if (e instanceof AppError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  return NextResponse.json(
    { error: "No pudimos consultar tu membresía." },
    { status: 503 },
  );
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  const profile = await currentProfile();
  if (!profile || profile.role !== "driver")
    return NextResponse.json(
      { error: "Inicia sesión como conductor." },
      { status: 401 },
    );
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    body = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    // Unreadable bodies were always answered with the phone message.
    body = { plan: "monthly", accepted: true, phone: "" };
  }
  try {
    return NextResponse.json(await startPayment(profile, body), {
      headers: noStore,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  const profile = await currentProfile();
  if (!profile || profile.role !== "driver")
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    return NextResponse.json(await paymentSummary(profile), {
      headers: noStore,
    });
  } catch (e) {
    return failure(e);
  }
}
