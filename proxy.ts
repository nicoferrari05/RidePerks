import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/driver/:path*",
    "/business/:path*",
    "/login",
    "/register",
    "/recover",
    "/auth/:path*",
    "/account/:path*",
    "/api/platform/:path*",
  ],
};
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login")
      return NextResponse.next();
    if (
      await verifySessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
    ) {
      if (
        pathname.startsWith("/api/") &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
        request.headers.get("origin") !== request.nextUrl.origin
      )
        return NextResponse.json(
          { error: "Solicitud no autorizada." },
          { status: 403 },
        );
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/"))
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const businessPublic =
    pathname === "/business/login" || pathname === "/business/register";
  const loginPath = pathname.startsWith("/business")
    ? "/business/login"
    : "/login";
  const protectedPath =
    pathname.startsWith("/driver") ||
    (pathname.startsWith("/business") && !businessPublic) ||
    pathname.startsWith("/account");
  if (!url || !key) {
    if (protectedPath)
      return NextResponse.redirect(new URL(loginPath, request.url));
    return NextResponse.next();
  }
  let response = NextResponse.next({ request });
  const auth = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          }),
        );
      },
    },
  });
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user && protectedPath) {
    const target = new URL(loginPath, request.url);
    target.searchParams.set("next", pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
