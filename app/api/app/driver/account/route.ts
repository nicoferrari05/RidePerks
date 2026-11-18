import {
  appOptions,
  appRoute,
  publicProfile,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { unreadNotifications } from "@/lib/platform/data";
import { membershipLabel } from "@/lib/platform/driver-screens";

// Cuenta: the same values as /driver/profile.
export const GET = appRoute(async () => {
  const p = await requireAppProfile("driver");
  const [membership, unread] = await Promise.all([
    membershipLabel(p),
    unreadNotifications(p.id),
  ]);
  return { profile: publicProfile(p), membership, unread };
});

export const OPTIONS = appOptions;
