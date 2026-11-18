import { redirect } from "next/navigation";
import { requireDriver } from "@/lib/platform/data";
import { dashboardData } from "@/lib/platform/driver-screens";
import { DashboardView } from "@/components/platform/driver/views";
export default async function Page() {
  const p = await requireDriver();
  // null = new account; undefined would mean the column is not migrated yet.
  if (p.onboarded_at === null) redirect("/driver/welcome");
  const d = await dashboardData(p);
  return (
    <DashboardView
      profile={p}
      monthly={d.monthly}
      total={d.total}
      history={d.history}
      featured={d.featured}
      live={d.live}
      hasAccess={d.hasAccess}
      verificationPending={d.verificationPending}
      unread={d.unread}
    />
  );
}
