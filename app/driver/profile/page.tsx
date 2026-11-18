import { requireDriver, unreadNotifications } from "@/lib/platform/data";
import { membershipLabel } from "@/lib/platform/driver-screens";
import { AccountView } from "@/components/platform/driver/views";
export const metadata = { title: "Cuenta · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const [membership, unread] = await Promise.all([
    membershipLabel(p),
    unreadNotifications(p.id),
  ]);
  return <AccountView profile={p} membership={membership} unread={unread} />;
}
