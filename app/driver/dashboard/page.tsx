import {
  requireDriver,
  getRedemptions,
  getMonthlySavings,
  getTotalSavings,
  catalogLive,
  getBenefits,
} from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DashboardView } from "@/components/platform/driver/views";
export default async function Page() {
  const p = await requireDriver();
  const [history, monthly, total, live, access] = await Promise.all([
    getRedemptions(p.id),
    getMonthlySavings(p.id),
    getTotalSavings(p.id),
    catalogLive(),
    getSupabaseAdmin().rpc("rp_has_access", { p_driver: p.id }),
  ]);
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  const featured = live ? (await getBenefits()).slice(0, 6) : [];
  return (
    <DashboardView
      profile={p}
      monthly={monthly}
      total={total}
      history={history}
      featured={featured}
      live={live}
      hasAccess={Boolean(access.data)}
    />
  );
}
