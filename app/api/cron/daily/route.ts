import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { notifyMembershipExpiring } from "@/lib/email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel Cron calls this once a day with "Authorization: Bearer $CRON_SECRET".
// 1) Stale pending Yappy orders expire (a late confirmed notice still applies).
// 2) Drivers whose paid time ends in 2–3 days get a renewal reminder.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const sent = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from("Bearer " + (secret || ""));
  if (
    !secret ||
    sent.length !== expected.length ||
    !timingSafeEqual(sent, expected)
  )
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const db = getSupabaseAdmin();
  const expired = await db.rpc("rp_expire_stale_orders");
  const from = new Date(Date.now() + 2 * 86400000).toISOString();
  const until = new Date(Date.now() + 3 * 86400000).toISOString();
  const due = await db
    .from("rp_memberships")
    .select("driver_id,valid_until")
    .gte("valid_until", from)
    .lt("valid_until", until);
  let reminded = 0;
  for (const row of due.data || []) {
    const state = await db.rpc("rp_access_state", { p_driver: row.driver_id });
    if (state.error || state.data?.lifetime || state.data?.status !== "enabled")
      continue;
    if (await notifyMembershipExpiring(row.driver_id, row.valid_until))
      reminded++;
  }
  return NextResponse.json({
    expiredOrders: expired.error ? null : expired.data,
    reminded,
  });
}
