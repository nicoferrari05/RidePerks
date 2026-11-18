import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { mediaUrl, requireBusiness } from "@/lib/platform/data";
import { readHours } from "@/lib/platform/hours";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// What the owner edits in Cuenta (BusinessAccountView on the web): business
// info, hours, logo and photos, and the staff with access.
export const GET = appRoute(async () => {
  await requireAppProfile("business");
  const { business, role } = await requireBusiness();
  if (!business || role !== "owner")
    throw new AppError("Solo el administrador puede gestionar el comercio.", 403);
  const db = getSupabaseAdmin();
  const [staff, pendingChange] = await Promise.all([
    db
      .from("rp_business_members")
      .select("user_id,rp_profiles(full_name)")
      .eq("business_id", business.id)
      .eq("role", "staff")
      .eq("is_active", true),
    db
      .from("rp_business_changes")
      .select("id")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .maybeSingle(),
  ]);
  if (staff.error) throw new Error("No pudimos consultar el personal.");
  return {
    info: {
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone || "",
      category: business.category,
    },
    pending_change: Boolean(pendingChange.data),
    hours: readHours(business.hours),
    logo: business.logo_path
      ? { path: business.logo_path, url: mediaUrl(business.logo_path) }
      : null,
    photos: (business.photo_paths || []).map((path) => ({ path, url: mediaUrl(path) })),
    staff: (staff.data || []).map((m) => ({
      user_id: m.user_id as string,
      full_name:
        (m.rp_profiles as unknown as { full_name: string } | null)?.full_name || "",
    })),
  };
});

export const OPTIONS = appOptions;
