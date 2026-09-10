import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { verifyYappyNotification } from "@/lib/payments/yappy-protocol";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  // Continue accepting already-issued payment notifications even when new checkout is disabled.
  const secret = process.env.YAPPY_SECRET_KEY,
    domain = process.env.YAPPY_DOMAIN;
  if (!secret || !domain)
    return NextResponse.json({ success: false }, { status: 503 });
  const notification = verifyYappyNotification(
    request.nextUrl.searchParams,
    secret,
    domain,
  );
  if (!notification)
    return NextResponse.json({ success: false }, { status: 401 });
  const { error } = await getSupabaseAdmin().rpc("rp_apply_payment", {
    p_order: notification.orderId,
    p_status: notification.status,
    p_domain: notification.domain,
  });
  return NextResponse.json(
    { success: !error },
    { status: error ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
