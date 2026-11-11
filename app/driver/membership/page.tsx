import { requireDriver } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { yappyConfig } from "@/lib/payments/yappy";
import { YAPPY_SCRIPT, parsePlan } from "@/lib/payments/yappy-protocol";
import YappyCheckout from "@/components/platform/YappyCheckout";
import { MembershipView } from "@/components/platform/driver/account-views";
export const metadata = { title: "Membresía · RidePerks" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const profile = await requireDriver();
  // The landing's pricing links here with ?plan=annual to preselect it.
  const plan = parsePlan((await searchParams).plan) ?? "monthly";
  const db = getSupabaseAdmin();
  const [setting, access, receipts] = await Promise.all([
    db.from("rp_settings").select("value").eq("key", "free_access").single(),
    db.rpc("rp_access_state", { p_driver: profile.id }),
    db
      .from("rp_payment_orders")
      .select("id,paid_at,amount_cents")
      .eq("driver_id", profile.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(24),
  ]);
  if (setting.error) throw new Error("No pudimos consultar el acceso.");
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  return (
    <MembershipView
      state={access.data}
      free={setting.data.value === true}
      verified={profile.status === "verified"}
      receipts={receipts.data || []}
      checkout={
        yappyConfig() ? (
          <YappyCheckout
            phone={profile.phone || ""}
            scriptUrl={YAPPY_SCRIPT}
            initialPlan={plan}
          />
        ) : null
      }
    />
  );
}
