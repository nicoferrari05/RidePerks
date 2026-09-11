// Creates (or reuses, if already present) two clearly-labeled QA accounts in
// whatever Supabase project SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY point to —
// a verified driver and a linked business with one active benefit — so a
// human can log into /driver and /business in a real browser and click
// through the real flows. Idempotent: safe to re-run, never duplicates rows.
//
// Mirrors exactly what lib/platform/auth-actions.ts's registerAccount() does
// (auth.admin.createUser with email_confirm:true, same user_metadata shape,
// same role-promotion update for the business account) instead of inventing
// a separate path.
//
// Uses @example.com addresses (RFC 2606 reserved, can't collide with a real
// driver/merchant's inbox) and names/titles prefixed "RidePerks QA" so these
// rows are unmistakable in the admin panel and easy to find and delete later.
//
// Usage: node --env-file=.env.local scripts/seed-qa-accounts.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const DRIVER_EMAIL = "qa-driver@example.com";
const DRIVER_PASSWORD = "RidePerksQA-Driver-2026!";
const BUSINESS_EMAIL = "qa-business@example.com";
const BUSINESS_PASSWORD = "RidePerksQA-Business-2026!";

async function findUserByEmail(email) {
  // supabase-js v2 has no direct getUserByEmail; page through admin.listUsers.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser({ email, password, full_name, phone, platform }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`  already exists (${email}) -> ${existing.id}`);
    return existing.id;
  }
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, platform },
  });
  if (error || !data.user) throw error || new Error("createUser returned no user");
  console.log(`  created (${email}) -> ${data.user.id}`);
  return data.user.id;
}

async function main() {
  console.log(`Target project: ${url}`);
  const settings = await db.from("rp_settings").select("value").eq("key", "free_access").single();
  console.log(`rp_settings.free_access = ${JSON.stringify(settings.data?.value)}`);

  console.log("\n1. Driver account");
  const driverId = await ensureUser({
    email: DRIVER_EMAIL,
    password: DRIVER_PASSWORD,
    full_name: "QA Conductor (prueba)",
    phone: "+50760000000",
    platform: "uber",
  });
  const driverUpdate = await db
    .from("rp_profiles")
    .update({ role: "driver", status: "verified" })
    .eq("id", driverId);
  if (driverUpdate.error) throw driverUpdate.error;
  console.log("  status set to verified (skips the photo-review step for QA convenience)");

  console.log("\n2. Business owner account");
  const businessOwnerId = await ensureUser({
    email: BUSINESS_EMAIL,
    password: BUSINESS_PASSWORD,
    full_name: "QA Comercio (prueba)",
    phone: "+50760000001",
    platform: "multiple",
  });
  const ownerUpdate = await db
    .from("rp_profiles")
    .update({ role: "business", status: "verified" })
    .eq("id", businessOwnerId);
  if (ownerUpdate.error) throw ownerUpdate.error;

  console.log("\n3. Business record");
  let business = await db
    .from("rp_businesses")
    .select("id,name")
    .eq("owner_user_id", businessOwnerId)
    .maybeSingle();
  if (business.error) throw business.error;
  let businessId = business.data?.id;
  if (businessId) {
    console.log(`  already exists -> ${businessId}`);
  } else {
    const created = await db
      .from("rp_businesses")
      .insert({
        name: "RidePerks QA — Comercio de prueba (no usar)",
        description: "Cuenta interna para probar el portal de comercio. No es un negocio real.",
        category: "combustible",
        address: "Ciudad de Panamá (cuenta de prueba)",
        phone: "+50760000001",
        owner_user_id: businessOwnerId,
        is_active: true,
      })
      .select("id")
      .single();
    if (created.error) throw created.error;
    businessId = created.data.id;
    console.log(`  created -> ${businessId}`);
  }

  console.log("\n4. Benefit");
  const benefitTitle = "RidePerks QA — Beneficio de prueba (no usar)";
  let benefit = await db
    .from("rp_benefits")
    .select("id")
    .eq("business_id", businessId)
    .eq("title", benefitTitle)
    .maybeSingle();
  if (benefit.error) throw benefit.error;
  if (benefit.data?.id) {
    console.log(`  already exists -> ${benefit.data.id}`);
  } else {
    const created = await db
      .from("rp_benefits")
      .insert({
        business_id: businessId,
        title: benefitTitle,
        description: "Beneficio de prueba para validar el flujo de canje. No es una oferta real.",
        discount_label: "10% de descuento (prueba)",
        category: "combustible",
        savings_amount: 5.0,
        terms: "Cuenta de prueba, uso interno del equipo de RidePerks.",
        monthly_limit: 100,
        is_active: true,
      })
      .select("id")
      .single();
    if (created.error) throw created.error;
    console.log(`  created -> ${created.data.id}`);
  }

  console.log("\nListo. Credenciales:");
  console.log(`  Driver:   ${DRIVER_EMAIL} / ${DRIVER_PASSWORD}  (ya verificado)`);
  console.log(`  Comercio: ${BUSINESS_EMAIL} / ${BUSINESS_PASSWORD}  (dueño de "RidePerks QA — Comercio de prueba")`);
  console.log("\nPara borrar todo después: scripts/unseed-qa-accounts.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
