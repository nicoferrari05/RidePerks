import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const run = randomUUID(),
  password = "Rp-qa-" + randomUUID();
const email = "rideperks-qa-" + run + "@example.com",
  businessEmail = "rideperks-shop-" + run + "@example.com";
let driverId = "",
  ownerId = "",
  shopId = "",
  benefitId = "";
const users: string[] = [];
async function signIn(page: Page, mail: string) {
  await page.goto(mail === businessEmail ? "/business/login" : "/login");
  await page.getByLabel("Correo electrónico").fill(mail);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/(driver\/dashboard|business)$/, {
    timeout: 20000,
  });
}
test.beforeAll(async () => {
  // Fail before creating fixtures when the target is unconfigured or protected by SSO.
  const origin = process.env.TEST_BASE_URL || "http://localhost:3100";
  const health = await fetch(new URL("/api/health", origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  const status = health.ok ? await health.json().catch(() => null) : null;
  if (status?.status !== "ok")
    throw new Error(
      "Target application is unavailable or protected. Configure it before live tests.",
    );
  const check = await db.from("rp_settings").select("key").limit(1);
  if (check.error)
    throw new Error("Apply the platform migration before live tests.");
  for (const [mail, name] of [
    [email, "Prueba QA Conductor"],
    [businessEmail, "Prueba QA Comercio"],
  ]) {
    const result = await db.auth.admin.createUser({
      email: mail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: "+507 60000000",
        platform: "uber",
      },
    });
    if (result.error) throw new Error(result.error.message);
    users.push(result.data.user.id);
  }
  [driverId, ownerId] = users;
  const membership = await db.from("rp_memberships").insert({
    driver_id: driverId,
    valid_until: new Date(Date.now() + 3600000).toISOString(),
  });
  if (membership.error) throw new Error(membership.error.message);
  const shop = await db.rpc("rp_save_business", {
    p_id: null,
    p_values: {
      name: "QA temporal " + run.slice(0, 8),
      description: "Registro temporal de pruebas, no es una oferta real.",
      address: "Panamá (pruebas)",
      category: "comida",
      owner_user_id: ownerId,
    },
  });
  if (shop.error) throw new Error(shop.error.message);
  shopId = shop.data;
  const benefit = await db
    .from("rp_benefits")
    .insert({
      business_id: shopId,
      title: "Beneficio QA " + run.slice(0, 8),
      description: "Prueba temporal del flujo completo.",
      discount_label: "Beneficio de prueba",
      terms: "Solo automatización QA. No válido comercialmente.",
      category: "comida",
      savings_amount: 2,
      monthly_limit: 2,
    })
    .select("id")
    .single();
  if (benefit.error) throw new Error(benefit.error.message);
  benefitId = benefit.data.id;
});
test.afterAll(async () => {
  // Delete only the exact temporary IDs created by this test run.
  if (driverId) {
    const files = await db.storage.from("rp-verifications").list(driverId);
    if (files.data?.length)
      await db.storage
        .from("rp-verifications")
        .remove(files.data.map((f) => driverId + "/" + f.name));
    for (const table of [
      "rp_redemptions",
      "rp_qr_tokens",
      "rp_verifications",
      "rp_support_requests",
    ])
      await db.from(table).delete().eq("driver_id", driverId);
  }
  if (benefitId) await db.from("rp_benefits").delete().eq("id", benefitId);
  if (shopId) {
    await db.from("rp_business_members").delete().eq("business_id", shopId);
    await db.from("rp_businesses").delete().eq("id", shopId);
  }
  if (driverId)
    await db.from("rp_memberships").delete().eq("driver_id", driverId);
  if (ownerId)
    await db
      .from("rp_rate_limits")
      .delete()
      .eq("key", "redeem:" + ownerId);
  for (const id of users) await db.auth.admin.deleteUser(id);
  if (shopId) await db.from("rp_admin_audit").delete().eq("subject_id", shopId);
});
test("driver onboarding, private verification, admin approval and merchant redemption", async ({
  browser,
}) => {
  const driverContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await driverContext.newPage();
  await signIn(page, email);
  await expect(
    page.getByRole("heading", { name: "Un paso más para usar tus beneficios" }),
  ).toBeVisible();
  await page.goto("/driver/benefits/" + benefitId);
  await expect(
    page.getByRole("link", { name: "Verificar mi cuenta", exact: true }),
  ).toBeVisible();
  const refused = await page.request.post("/api/platform/token", {
    headers: { Origin: process.env.TEST_BASE_URL || "http://localhost:3100" },
    data: { benefit_id: benefitId },
  });
  expect(refused.status()).toBe(400);
  await page.goto("/driver/verify");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMj8AAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByLabel("Captura de tu perfil de conductor").setInputFiles({
    name: "qa-profile.png",
    mimeType: "image/png",
    buffer: png,
  });
  await page.getByRole("button", { name: "Enviar para revisión" }).click();
  await expect(
    page.getByRole("heading", { name: "Estamos revisando tu solicitud" }),
  ).toBeVisible({ timeout: 20000 });
  const verification = await db
    .from("rp_verifications")
    .select("id,photo_path")
    .eq("driver_id", driverId)
    .single();
  expect(verification.error).toBeNull();
  const publicPhoto = await page.request.get(
    process.env.SUPABASE_URL +
      "/storage/v1/object/public/rp-verifications/" +
      verification.data!.photo_path,
  );
  expect(publicPhoto.ok()).toBe(false);
  const adminOrigin =
    process.env.TEST_ADMIN_BASE_URL ||
    process.env.TEST_BASE_URL ||
    "http://localhost:3100";
  const admin = await browser.newContext({ baseURL: adminOrigin });
  const adminPage = await admin.newPage();
  const adminLogin = await adminPage.request.post("/api/admin/login", {
    headers: { Origin: adminOrigin },
    data: { password: process.env.ADMIN_PASSWORD },
  });
  expect(adminLogin.ok()).toBe(true);
  await adminPage.goto("/admin/platform");
  const card = adminPage.locator("article").filter({
    has: adminPage.getByRole("heading", { name: "Prueba QA Conductor" }),
  });
  await card.getByRole("button", { name: "Aprobar verificación" }).click();
  await expect(card).toHaveCount(0, { timeout: 15000 });
  await page.goto("/driver/benefits/" + benefitId);
  await page.getByRole("button", { name: "Generar mi código" }).click();
  await expect(page.locator(".rp-qr code")).toBeVisible();
  const token = (await page.locator(".rp-qr code").textContent())!;
  const merchant = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const merchantPage = await merchant.newPage();
  await signIn(merchantPage, businessEmail);
  await merchantPage.getByLabel("Código del conductor").fill(token);
  await merchantPage
    .getByRole("button", { name: "Consultar beneficio" })
    .click();
  await merchantPage
    .getByRole("button", { name: "Confirmar y aplicar beneficio" })
    .click();
  await expect(
    merchantPage.getByRole("heading", { name: "Beneficio confirmado" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Beneficio confirmado" }),
  ).toBeVisible({ timeout: 15000 });
  const second = await merchantPage.request.post("/api/platform/redeem", {
    headers: { Origin: process.env.TEST_BASE_URL || "http://localhost:3100" },
    data: { token },
  });
  expect(second.status()).toBe(400);
  const limit = await db.from("rp_rate_limits").upsert({
    key: "redeem:" + ownerId,
    hits: 60,
    window_start: new Date().toISOString(),
  });
  expect(limit.error).toBeNull();
  const limited = await merchantPage.request.post("/api/platform/redeem", {
    headers: { Origin: process.env.TEST_BASE_URL || "http://localhost:3100" },
    data: { token: "ZZZZZZ" },
  });
  expect(limited.status()).toBe(429);
  await db
    .from("rp_rate_limits")
    .delete()
    .eq("key", "redeem:" + ownerId);
  await page.goto("/driver/history");
  await expect(
    page.getByRole("heading", { name: /2,?\.00|2,00/ }),
  ).toBeVisible();
  const rows = await db
    .from("rp_redemptions")
    .select("id")
    .eq("driver_id", driverId);
  expect(rows.data).toHaveLength(1);
  for (const width of [320, 375, 430, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/driver/dashboard",
      "/driver/benefits",
      "/driver/directory",
      "/driver/history",
      "/driver/profile",
      "/driver/membership",
      "/driver/verify",
      "/driver/help",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path:
          "artifacts/" +
          route.replaceAll("/", "-").slice(1) +
          "-" +
          width +
          ".png",
        fullPage: true,
      });
    }
  }
  await page.goto("/driver/help");
  await page
    .getByLabel("Cuéntanos qué necesitas")
    .fill("Solicitud de prueba QA, se eliminará al terminar.");
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByRole("status")).toContainText("Recibimos");
  await page.goto("/driver/profile");
  await page.getByLabel("Nombre completo").fill("Prueba QA Actualizada");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/driver/dashboard");
  await expect(page).toHaveURL(/\/login/);
  const ownCookies = await merchant.cookies();
  expect(
    ownCookies.filter((c) => c.name.startsWith("sb-")).every((c) => c.httpOnly),
  ).toBe(true);
  await admin.close();
  await merchant.close();
  await driverContext.close();
});
