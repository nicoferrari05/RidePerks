import {
  appOptions,
  appRoute,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { createStaffInvite } from "@/lib/platform/business-actions";

// Personal autorizado → invitación: the web's own createStaffInvite. The
// link opens the web, where the employee creates their account and accepts.
export const POST = appRoute(async () => {
  await requireAppProfile("business");
  const result = await runAction(createStaffInvite, {});
  return { link: (process.env.SITE_URL || "https://rideperks.app") + result.success };
});

export const OPTIONS = appOptions;
