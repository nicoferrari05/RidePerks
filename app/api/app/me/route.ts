import { unreadNotifications } from "@/lib/platform/data";
import {
  appOptions,
  appRoute,
  publicProfile,
  requireAppProfile,
} from "@/lib/platform/app-api";

// Who is signed in on the phone. The app calls it on launch to know whether
// the saved session still works and which screens to show.
export const GET = appRoute(async () => {
  const profile = await requireAppProfile();
  return {
    profile: publicProfile(profile),
    unread: await unreadNotifications(profile.id),
  };
});

export const OPTIONS = appOptions;
