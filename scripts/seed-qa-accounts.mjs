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
//
// Passwords: set QA_DRIVER_PASSWORD / QA_BUSINESS_PASSWORD to pin them (e.g.
// for a shared QA environment), otherwise a fresh random password is
// generated each run and printed at the end. Re-running against accounts
// that already exist always resets their password to this run's value, so
// the credentials printed at the end are always the accounts' real,
// currently-working credentials — never stale.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local).");
  process.exit(1);
}

// --- Guard against accidentally seeding a real/production project ---------
// This script creates auth users with known emails and passwords, so running
// it against the wrong project hands out working credentials. The only
// signal that actually says which project gets written to is SUPABASE_URL
// itself — VERCEL_ENV / NODE_ENV / SITE_URL are kept as extra tripwires
// below, but none of them is reliable on its own: an operator's .env.local
// can easily have SUPABASE_URL pointing at production while SITE_URL still
// says localhost and NODE_ENV is unset.
//
// We can't truly know which Supabase project is "production" from inside
// this script — only the operator knows that for certain. So: local/loopback
// URLs are treated as safe by default, anything the operator lists in
// QA_SUPABASE_URL_ALLOWLIST (comma-separated URLs or substrings, e.g. a
// project ref) is treated as safe, and everything else — including any
// other hosted *.supabase.co project, which is exactly where a production
// project would live — is refused unless explicitly allowed.
const allowProduction =
  process.env.ALLOW_PRODUCTION_SEED === "1" || process.argv.includes("--i-know-this-is-production");

function envLooksProductionish() {
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.NODE_ENV === "production") return true;
  const site = process.env.SITE_URL || "";
  if (site && !/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(site)) return true;
  return false;
}

function urlIsAllowlisted() {
  if (/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(url)) return true;
  const allowlist = (process.env.QA_SUPABASE_URL_ALLOWLIST || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowlist.some((entry) => url === entry || url.includes(entry));
}

if (!allowProduction && (envLooksProductionish() || !urlIsAllowlisted())) {
  console.error(
    "Refusing to run: SUPABASE_URL doesn't look like a recognised non-production target.\n" +
      `  SUPABASE_URL = ${url}\n` +
      "This script writes real auth users with known email/password combinations.\n" +
      "If this is genuinely a QA/dev/staging project, either:\n" +
      "  - add it to QA_SUPABASE_URL_ALLOWLIST (comma-separated URLs or substrings, e.g. the project ref), or\n" +
      "  - re-run with ALLOW_PRODUCTION_SEED=1 or --i-know-this-is-production\n" +
      "This check is a best-effort heuristic (SUPABASE_URL / VERCEL_ENV / NODE_ENV / SITE_URL) " +
      "and cannot truly know which project is production — that's on the operator to confirm."
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function generatePassword() {
  return `RP-qa-${randomBytes(18).toString("base64url")}`;
}

const DRIVER_EMAIL = "qa-driver@example.com";
const DRIVER_PASSWORD = process.env.QA_DRIVER_PASSWORD || generatePassword();
const BUSINESS_EMAIL = "qa-business@example.com";
const BUSINESS_PASSWORD = process.env.QA_BUSINESS_PASSWORD || generatePassword();

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
    // Reset the password to this run's value too, not just look the account
    // up: otherwise the credentials printed at the end would be a freshly
    // generated password that was never actually applied, and the operator
    // would be handed a login that doesn't work.
    const { error } = await db.auth.admin.updateUserById(existing.id, { password });
    if (error) throw error;
    console.log(`  already exists (${email}) -> ${existing.id} (password reset to this run's value)`);
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
