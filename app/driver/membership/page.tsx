import { requireDriver } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { yappyConfig } from "@/lib/payments/yappy";
import { YAPPY_SCRIPT } from "@/lib/payments/yappy-protocol";
import YappyCheckout from "@/components/platform/YappyCheckout";
import { MembershipView } from "@/components/platform/driver/account-views";
export const metadata = { title: "Membresía · RidePerks" };
export default async function Page() {
  const profile = await requireDriver();
  const db = getSupabaseAdmin();
  const [setting, access] = await Promise.all([
    db.from("rp_settings").select("value").eq("key", "free_access").single(),
    db.rpc("rp_access_state", { p_driver: profile.id }),
  ]);
  if (setting.error) throw new Error("No pudimos consultar el acceso.");
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  return (
    <MembershipView
      state={access.data}
      free={setting.data.value === true}
      verified={profile.status === "verified"}
      checkout={
        yappyConfig() ? (
          <YappyCheckout phone={profile.phone || ""} scriptUrl={YAPPY_SCRIPT} />
        ) : null
      }
    />
  );
}
