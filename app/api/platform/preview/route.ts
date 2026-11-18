import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/platform/data";
import { previewCode } from "@/lib/platform/counter";
import { AppError } from "@/lib/platform/app-api";
// Business account: who a code belongs to, before confirming it. The rules live in lib/platform/counter.ts, shared with the
// phone app.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Solicitud no autorizada." },
      { status: 403 },
    );
  const profile = await currentProfile();
  let body;
  try {
    if (!profile || profile.role !== "business" || profile.status === "suspended")
      throw new AppError("Inicia sesión como comercio.", 401);
    try {
      body = await request.json();
    } catch {
      throw new AppError("Solicitud inválida.", 400);
    }
    return NextResponse.json(await previewCode(profile, body?.token), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    if (e instanceof AppError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Intenta nuevamente." }, { status: 500 });
  }
}
