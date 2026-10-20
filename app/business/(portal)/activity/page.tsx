import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  loadBusinessStats,
  periodRange,
  periods,
} from "@/components/platform/BusinessMetrics";
import { ActivityView } from "@/components/platform/business/views";
export const metadata = { title: "Actividad · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { business, profile, role } = await requireBusiness();
  if (!business || role !== "owner") redirect("/business");
  const requested = (await searchParams).period;
  const period = periods.some(([v]) => v === requested) ? requested! : "30";
  const { from, until } = periodRange(period);
  const db = getSupabaseAdmin();
  const [stats, recent, ratings] = await Promise.all([
    loadBusinessStats(business.id, profile.id, period),
    db
      .from("rp_redemptions")
      .select("id,benefit_title,redeemed_at,redeemed_via")
      .eq("business_id", business.id)
      .order("redeemed_at", { ascending: false })
      .limit(30),
    db
      .from("rp_redemption_feedback")
      .select("rating,applied")
      .eq("business_id", business.id)
      .gte("created_at", from.toISOString())
      .lt("created_at", until.toISOString())
      .limit(5000),
  ]);
  if (recent.error) throw new Error("No pudimos cargar los usos.");
  const rows = ratings.data || [];
  const feedback = {
    count: rows.length,
    avg: rows.length
      ? rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length
      : null,
    notApplied: rows.filter((r) => !r.applied).length,
  };
  return (
    <ActivityView
      stats={stats}
      period={period}
      recent={recent.data}
      feedback={feedback}
    />
  );
}
