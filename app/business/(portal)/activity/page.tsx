import { redirect } from "next/navigation";
import { requireBusiness } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  loadBusinessStats,
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
  const [stats, recent] = await Promise.all([
    loadBusinessStats(business.id, profile.id, period),
    getSupabaseAdmin()
      .from("rp_redemptions")
      .select("id,benefit_title,redeemed_at,redeemed_via")
      .eq("business_id", business.id)
      .order("redeemed_at", { ascending: false })
      .limit(30),
  ]);
  if (recent.error) throw new Error("No pudimos cargar los usos.");
  return <ActivityView stats={stats} period={period} recent={recent.data} />;
}
