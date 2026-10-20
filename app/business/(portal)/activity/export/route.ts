import { NextRequest } from "next/server";
import { requireBusiness } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { periodRange, periods } from "@/components/platform/BusinessMetrics";
export const dynamic = "force-dynamic";
// The owner's uses for a period as CSV (opens in Excel / Google Sheets).
// No driver names: the business only needs what was used and when.
export async function GET(request: NextRequest) {
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner")
    return new Response("No autorizado.", { status: 403 });
  const db = getSupabaseAdmin();
  const check = await db.rpc("rp_business_role", {
    p_user: profile.id,
    p_business: business.id,
  });
  if (check.error || check.data !== "owner")
    return new Response("No autorizado.", { status: 403 });
  const requested = request.nextUrl.searchParams.get("period") || "30";
  const period = periods.some(([v]) => v === requested) ? requested : "30";
  const { from, until, fromDay, toDay } = periodRange(period);
  const { data, error } = await db
    .from("rp_redemptions")
    .select("redeemed_at,benefit_title,savings_amount,redeemed_via")
    .eq("business_id", business.id)
    .gte("redeemed_at", from.toISOString())
    .lt("redeemed_at", until.toISOString())
    .order("redeemed_at", { ascending: true })
    .limit(20000);
  if (error) return new Response("No pudimos generar el archivo.", { status: 503 });
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Panama",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = new Intl.DateTimeFormat("es-PA", {
    timeZone: "America/Panama",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // Quote every cell and neutralize spreadsheet formulas (=, +, -, @).
  const cell = (value: string) =>
    '"' + value.replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""') + '"';
  const lines = [
    ["Fecha", "Hora", "Beneficio", "Ahorro (USD)", "Confirmado con"].map(cell),
    ...data.map((r) =>
      [
        date.format(new Date(r.redeemed_at)),
        time.format(new Date(r.redeemed_at)),
        r.benefit_title,
        r.savings_amount === null ? "" : Number(r.savings_amount).toFixed(2),
        r.redeemed_via === "pin" ? "PIN" : "Cuenta",
      ].map(cell),
    ),
  ];
  const name = (
    "rideperks-usos-" +
    business.name.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-") +
    "-" +
    fromDay +
    "-a-" +
    toDay
  ).toLowerCase();
  // BOM so Excel reads the accents as UTF-8.
  return new Response("﻿" + lines.map((l) => l.join(",")).join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + name + '.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
