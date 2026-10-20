import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const PHOTO_BUCKET = "rp-verifications";

// Verification screenshots are only needed while a review is pending: once
// decided (or the account is closed) the private file is deleted.
export async function purgeVerificationPhotos(driverId: string) {
  const db = getSupabaseAdmin();
  const rows = await db
    .from("rp_verifications")
    .select("photo_path")
    .eq("driver_id", driverId)
    .neq("photo_path", "deleted");
  if (rows.error) return false;
  const paths = (rows.data || []).map((r) => r.photo_path as string);
  if (!paths.length) return true;
  const removed = await db.storage.from(PHOTO_BUCKET).remove(paths);
  if (removed.error) return false;
  const marked = await db
    .from("rp_verifications")
    .update({ photo_path: "deleted" })
    .eq("driver_id", driverId)
    .in("photo_path", paths);
  return !marked.error;
}

// Closes an account (an admin acting on a privacy request, or the person
// from Cuenta → Eliminar cuenta): blocks the login and scrubs personal data,
// but never touches redemption/payment history — a business's stats and
// RidePerks' own audit trail have to survive this. See rp_close_profile.
export async function closeAccount(
  id: string,
  reason: string,
): Promise<{ error: string } | { complete: boolean }> {
  const db = getSupabaseAdmin();
  // Block login first: if the profile scrub below fails, the account is
  // merely locked out (recoverable) rather than scrubbed but still usable.
  const ban = await db.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
  });
  if (ban.error)
    return { error: "No pudimos bloquear el inicio de sesión de la cuenta." };
  const { error } = await db.rpc("rp_close_profile", {
    p_id: id,
    p_reason: reason,
  });
  if (error)
    return {
      error:
        error.code === "P0001" ? error.message : "No pudimos cerrar la cuenta.",
    };
  // Beyond the profile row: screenshots, free-text support messages and the
  // waitlist entry all hold personal data. Redemptions/payments stay.
  const photos = await purgeVerificationPhotos(id);
  const messages = await db
    .from("rp_support_requests")
    .update({ message: "[Mensaje eliminado por cierre de cuenta]" })
    .eq("driver_id", id);
  const user = await db.auth.admin.getUserById(id);
  const email = user.data.user?.email;
  let waitlist = true;
  if (email) {
    const escaped = email.replace(/[\\%_]/g, "\\$&");
    const removed = await db.from("waitlist").delete().ilike("email", escaped);
    waitlist = !removed.error;
  }
  return { complete: photos && !messages.error && waitlist };
}
