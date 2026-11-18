import {
  appOptions,
  appRoute,
  publicProfile,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { requireBusiness, unreadNotifications } from "@/lib/platform/data";

// The business portal's frame: which business this person runs (or works
// at), their role and every business they can switch to. Also Cuenta's data.
export const GET = appRoute(async () => {
  await requireAppProfile("business");
  const { profile, business, role, businesses } = await requireBusiness();
  return {
    profile: publicProfile(profile),
    business: business
      ? { id: business.id, name: business.name, address: business.address }
      : null,
    role,
    businesses: businesses.map((row) => ({
      id: row.business.id,
      name: row.business.name,
    })),
    unread: await unreadNotifications(profile.id),
    support_email: process.env.SUPPORT_EMAIL || null,
  };
});

export const OPTIONS = appOptions;
