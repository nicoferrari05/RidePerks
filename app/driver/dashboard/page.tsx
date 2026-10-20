import { redirect } from "next/navigation";
import {
  requireDriver,
  getRedemptions,
  getMonthlySavings,
  getTotalSavings,
  catalogLive,
  getBenefits,
  unreadNotifications,
} from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { decorateBenefit } from "@/lib/platform/catalog";
import { DashboardView } from "@/components/platform/driver/views";
export default async function Page() {
  const p = await requireDriver();
  // null = new account; undefined would mean the column is not migrated yet.
  if (p.onboarded_at === null) redirect("/driver/welcome");
  const [history, monthly, total, live, access, unread] = await Promise.all([
    getRedemptions(p.id),
    getMonthlySavings(p.id),
    getTotalSavings(p.id),
    catalogLive(),
    getSupabaseAdmin().rpc("rp_has_access", { p_driver: p.id }),
    unreadNotifications(p.id),
  ]);
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  const featured = live
    ? (await getBenefits()).slice(0, 6).map((b) => decorateBenefit(b))
    : [];
  return (
    <DashboardView
      profile={p}
      monthly={monthly}
      total={total}
      history={history}
      featured={featured}
      live={live}
      hasAccess={Boolean(access.data)}
      unread={unread}
    />
  );
}
