// Removes everything scripts/seed-qa-accounts.mjs creates: the QA benefit,
// the QA business, and both QA auth users (which cascades their rp_profiles
// row via the FK's "on delete cascade"). Safe to run even if some or all of
// it was never created, or was already removed.
//
// Usage: node --env-file=.env.local scripts/unseed-qa-accounts.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const DRIVER_EMAIL = "qa-driver@example.com";
const BUSINESS_EMAIL = "qa-business@example.com";

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log(`Target project: ${url}`);

  const businessUser = await findUserByEmail(BUSINESS_EMAIL);
  if (businessUser) {
    const business = await db
      .from("rp_businesses")
      .select("id")
      .eq("owner_user_id", businessUser.id)
      .maybeSingle();
    if (business.error) throw business.error;
    if (business.data?.id) {
      const benefits = await db.from("rp_benefits").delete().eq("business_id", business.data.id);
      if (benefits.error) throw benefits.error;
      console.log("Deleted QA benefits.");
      const biz = await db.from("rp_businesses").delete().eq("id", business.data.id);
      if (biz.error) throw biz.error;
      console.log("Deleted QA business.");
    }
    const del = await db.auth.admin.deleteUser(businessUser.id);
    if (del.error) throw del.error;
    console.log(`Deleted business QA user (${BUSINESS_EMAIL}).`);
  } else {
    console.log(`No business QA user found (${BUSINESS_EMAIL}).`);
  }

  const driverUser = await findUserByEmail(DRIVER_EMAIL);
  if (driverUser) {
    const del = await db.auth.admin.deleteUser(driverUser.id);
    if (del.error) throw del.error;
    console.log(`Deleted driver QA user (${DRIVER_EMAIL}).`);
  } else {
    console.log(`No driver QA user found (${DRIVER_EMAIL}).`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
