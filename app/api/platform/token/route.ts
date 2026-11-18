import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/platform/data";
import { codeStatus, issueCode } from "@/lib/platform/codes";
import { AppError } from "@/lib/platform/app-api";

// The web's benefit codes. The rules live in lib/platform/codes.ts, shared
// with the phone app.
const noStore = { "Cache-Control": "private, no-store" };

function failure(e: unknown) {
  if (e instanceof AppError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  return NextResponse.json({ error: "Intenta nuevamente." }, { status: 500 });
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
      { error: "Inicia sesión para continuar." },
      { status: 401 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  try {
    return NextResponse.json(await issueCode(profile, body?.benefit_id), {
      headers: noStore,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET(request: NextRequest) {
  const profile = await currentProfile();
  if (!profile)
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    return NextResponse.json(
      await codeStatus(profile.id, request.nextUrl.searchParams.get("token")),
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
