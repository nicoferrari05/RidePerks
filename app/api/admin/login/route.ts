import { createHash } from "node:crypto";
import { rateLimit } from "@/lib/platform/data";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken, verifyPassword } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Solicitud no autorizada." }, { status: 403 });
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await rateLimit("admin:" + createHash("sha256").update(ip).digest("hex"), 10, 600);
    // Fixed-key bucket with no IP/header in it, so rotating x-forwarded-for
    // (or a distributed attacker spread across many IPs) can't bypass the
    // per-client limit above and grind through the single shared ADMIN_PASSWORD.
    await rateLimit("admin:global", 100, 600);
  } catch { return NextResponse.json({ error: "Demasiados intentos o servicio no disponible. Intenta más tarde." }, { status: 429 }); }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { password } = (body ?? {}) as Record<string, unknown>;

  if (typeof password !== "string" || password.length === 0 || !(await verifyPassword(password))) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours, also enforced in the signed token
  });
  return response;
}
