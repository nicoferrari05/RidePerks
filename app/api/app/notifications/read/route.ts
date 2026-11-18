import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { markNotificationsRead } from "@/lib/platform/app-actions";

// Opening Notificaciones marks everything read, as on the web.
export const POST = appRoute(async () => {
  await requireAppProfile();
  await markNotificationsRead();
  return { ok: true };
});

export const OPTIONS = appOptions;
