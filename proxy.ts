import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and its API route must stay reachable without a session.
  const isPublic = pathname === "/admin/login" || pathname === "/api/admin/login";
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}
