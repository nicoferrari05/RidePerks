import { requireDriver } from "@/lib/platform/data";
import { membershipPage } from "@/lib/payments/membership";
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
  const m = await membershipPage(profile);
  return (
    <MembershipView
      state={m.state}
      free={m.free}
      verified={m.verified}
      receipts={m.receipts}
      checkout={
        m.paymentsEnabled ? (
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
