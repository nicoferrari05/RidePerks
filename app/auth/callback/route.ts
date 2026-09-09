import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/platform/supabase";
import { safeNext } from "@/lib/platform/validation";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const auth = await createAuthClient();
      const { error } = await auth.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          new URL(
            safeNext(request.nextUrl.searchParams.get("next")),
            request.url,
          ),
        );
    } catch {
      /* Display a recoverable authentication error. */
    }
  }
  return NextResponse.redirect(new URL("/login?error=expired", request.url));
}
