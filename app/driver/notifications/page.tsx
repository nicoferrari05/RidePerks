import { requireDriver, getNotifications } from "@/lib/platform/data";
import { NotificationsView } from "@/components/platform/notifications";
export const metadata = { title: "Notificaciones · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  return (
    <NotificationsView
      items={await getNotifications(p.id)}
      back="/driver/dashboard"
    />
  );
}
