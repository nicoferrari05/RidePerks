import { requireBusiness, getNotifications } from "@/lib/platform/data";
import { NotificationsView } from "@/components/platform/notifications";
export const metadata = { title: "Notificaciones · RidePerks" };
export default async function Page() {
  const { profile } = await requireBusiness();
  return (
    <NotificationsView items={await getNotifications(profile.id)} back="/business" />
  );
}
