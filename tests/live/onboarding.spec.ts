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
const run = randomUUID();
const password = "Rp-onboarding-" + randomUUID();
const driverName = "QA registro conductor " + run;
const merchantName = "QA registro comercio " + run;
const shopName = "QA alta negocio " + run;
const email = (merchant: boolean) =>
  "rp-new-" + (merchant ? "shop-" : "") + run + "@example.com";
const ids: string[] = [];
let shopId = "";
async function register(page: Page, merchant: boolean) {
  await page.goto(merchant ? "/business/register" : "/register");
  await page
    .locator("[name=full_name]")
    .fill(merchant ? merchantName : driverName);
  await page.getByLabel("Correo electrónico").fill(email(merchant));
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.locator("[name=phone]").fill("+507 60000000");
  if (!merchant) await page.locator("[name=platform]").selectOption("uber");
  await page.locator("[name=terms]").check();
  await page
    .getByRole("button", {
      name: merchant ? "Crear cuenta de comercio" : "Crear mi cuenta gratis",
    })
    .click();
}
test.afterAll(async () => {
  const shops = await db
    .from("rp_businesses")
    .select("id")
    .eq("name", shopName);
  for (const shop of shops.data || []) {
    await db.from("rp_businesses").delete().eq("id", shop.id);
    await db.from("rp_admin_audit").delete().eq("subject_id", shop.id);
  }
  const profiles = await db
    .from("rp_profiles")
    .select("id")
    .in("full_name", [driverName, merchantName]);
  for (const profile of profiles.data || []) {
    const deleted = await db.auth.admin.deleteUser(profile.id);
    expect(deleted.error).toBeNull();
  }
});
test("registration sends no confirmation and admin creates and links a merchant without entering UUIDs", async ({
  page,
  browser,
}) => {
  const origin = process.env.TEST_BASE_URL || "http://localhost:3100";
  const health = await fetch(new URL("/api/health", origin));
  expect(health.ok).toBe(true);
  await register(page, false);
  await expect(page).toHaveURL(/\/driver\/dashboard$/, { timeout: 20000 });
  const driver = await db
    .from("rp_profiles")
    .select("id,role,status")
    .eq("full_name", driverName)
    .single();
  expect(driver.error).toBeNull();
  expect(driver.data?.role).toBe("driver");
  expect(driver.data?.status).toBe("pending");
  ids.push(driver.data!.id);
  await page.context().clearCookies();
  await register(page, true);
  await expect(page).toHaveURL(/\/business$/, { timeout: 20000 });
  await expect(
    page.getByRole("heading", {
      name: "Tu cuenta está lista. Falta vincular el comercio.",
    }),
  ).toBeVisible();
  const merchant = await db
    .from("rp_profiles")
    .select("id,role")
    .eq("full_name", merchantName)
    .single();
  expect(merchant.error).toBeNull();
  expect(merchant.data?.role).toBe("business");
  ids.push(merchant.data!.id);
  for (const id of ids) {
    const user = await db.auth.admin.getUserById(id);
    expect(user.data.user?.email_confirmed_at).toBeTruthy();
    expect(user.data.user?.confirmation_sent_at).toBeFalsy();
  }
  await page.screenshot({
    path: "artifacts/merchant-pending.png",
    fullPage: true,
  });
  const adminOrigin = process.env.TEST_ADMIN_BASE_URL || origin;
  const admin = await browser.newContext({ baseURL: adminOrigin });
  try {
    const adminPage = await admin.newPage();
    const login = await adminPage.request.post("/api/admin/login", {
      headers: { Origin: adminOrigin },
      data: { password: process.env.ADMIN_PASSWORD },
    });
    expect(login.ok()).toBe(true);
    await adminPage.goto("/admin/platform?tab=businesses");
    await adminPage.getByLabel("Nombre del comercio").fill(shopName);
    await adminPage
      .getByLabel("Descripción", { exact: true })
      .fill("Negocio temporal de prueba; se elimina al finalizar.");
    await adminPage
      .getByLabel("Dirección en Panamá")
      .fill("Panamá, prueba temporal");
    await expect(
      adminPage.getByLabel("Cuenta responsable (opcional)"),
    ).toHaveValue("");
    await adminPage.getByRole("button", { name: "Guardar comercio" }).click();
    await expect(adminPage.getByRole("status")).toHaveText(
      "Comercio guardado.",
      { timeout: 15000 },
    );
    const shop = await db
      .from("rp_businesses")
      .select("id,owner_user_id")
      .eq("name", shopName)
      .single();
    expect(shop.error).toBeNull();
    expect(shop.data?.owner_user_id).toBeNull();
    shopId = shop.data!.id;
    await adminPage.goto("/admin/platform?tab=businesses&edit=" + shopId);
    await adminPage
      .getByLabel("Cuenta responsable (opcional)")
      .selectOption(merchant.data!.id);
    await adminPage.getByRole("button", { name: "Guardar comercio" }).click();
    await expect(adminPage.getByRole("status")).toHaveText(
      "Comercio guardado.",
      { timeout: 15000 },
    );
    await adminPage.screenshot({
      path: "artifacts/admin-merchant-form.png",
      fullPage: true,
    });
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Tu cuenta está lista. Falta vincular el comercio.",
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText(shopName, { exact: true }).first(),
    ).toBeVisible();
    await page.setViewportSize({ width: 375, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "artifacts/merchant-linked-mobile.png",
      fullPage: true,
    });
  } finally {
    await admin.close();
  }
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email(true));
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Esta cuenta es de comercio",
    { timeout: 15000 },
  );
  await page.goto("/business");
  await expect(page).toHaveURL(/\/business\/login/);
  // Re-registering an existing address must not overwrite or convert the account.
  await register(page, false);
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "No pudimos crear la cuenta",
    { timeout: 15000 },
  );
  const unchanged = await db
    .from("rp_profiles")
    .select("role,status")
    .eq("id", ids[0])
    .single();
  expect(unchanged.data).toEqual({ role: "driver", status: "pending" });
});
