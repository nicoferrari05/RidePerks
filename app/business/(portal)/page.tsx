import { requireBusiness, unreadNotifications } from "@/lib/platform/data";
import { ScanView } from "@/components/platform/business/views";
// Escanear: the first thing anyone at the counter needs.
export default async function Page() {
  const { business, profile } = await requireBusiness();
  return (
    <ScanView
      business={business}
      profile={profile}
      unread={await unreadNotifications(profile.id)}
    />
  );
}
