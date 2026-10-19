import { requireBusiness } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { BusinessAccountView } from "@/components/platform/business/views";
export const metadata = { title: "Cuenta · RidePerks" };
export default async function Page() {
  const { business, profile, role, businesses } = await requireBusiness();
  const isOwner = Boolean(business) && role === "owner";
  const db = getSupabaseAdmin();
  const [staff, pendingChange] =
    business && isOwner
      ? await Promise.all([
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
        ])
      : [null, null];
  if (staff?.error) throw new Error("No pudimos consultar el personal.");
  return (
    <BusinessAccountView
      profile={profile}
      business={business}
      isOwner={isOwner}
      businesses={businesses.map((row) => ({
        id: row.business.id,
        name: row.business.name,
      }))}
      staff={(staff?.data || []).map((member) => ({
        user_id: member.user_id,
        full_name:
          (member.rp_profiles as unknown as { full_name: string } | null)
            ?.full_name || "",
      }))}
      pendingChange={Boolean(pendingChange?.data)}
    />
  );
}
