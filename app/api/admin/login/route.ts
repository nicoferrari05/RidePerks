import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken, verifyPassword } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
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
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
