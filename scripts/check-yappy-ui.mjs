import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const run = randomUUID(),
  password = "RP-qa-" + randomUUID();
const email = "rp-yappy-qa-" + run + "@example.com";
const created = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: "QA Yappy temporal",
    phone: "+507 60000000",
    platform: "uber",
  },
});
if (created.error) throw new Error(created.error.message);
const id = created.data.user.id;
let browser;
try {
  const verified = await db
    .from("rp_profiles")
    .update({ status: "verified" })
    .eq("id", id);
  if (verified.error) throw new Error(verified.error.message);
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  const origin = process.env.TEST_BASE_URL || "https://www.rideperks.app";
  await page.goto(origin + "/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/driver\/dashboard$/, { timeout: 20000 });
  let posted = 0,
    pending = false,
    failOnce = true;
  await page.route("**/api/payments/yappy", async (route) => {
    if (route.request().method() === "POST") {
      posted++;
      if (failOnce) {
        failOnce = false;
        await route.fulfill({
          status: 503,
          json: { error: "Fallo de conexión simulado para QA." },
        });
        return;
      }
      const data = route.request().postDataJSON();
      expect(data.accepted).toBe(true);
      expect(data.phone).toBe("60000000");
      pending = true;
      await route.fulfill({
        json: {
          orderId: "qa123456",
          transactionId: "qa-fake",
          documentName: "qa-fake",
          token: "qa-fake",
        },
      });
    } else
      await route.fulfill({
        json: {
          validUntil: null,
          orders: pending
            ? [
                {
                  id: "qa123456",
                  status: "pending",
                  created_at: new Date().toISOString(),
                  amount_cents: 1500,
                },
              ]
            : [],
        },
      });
  });
  await page.goto(origin + "/driver/membership");
  await expect(
    page.getByRole("heading", { name: "$15.00 al mes", exact: true }),
  ).toBeVisible();
  await expect(page.locator("btn-yappy")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Cargando Yappy…")).toHaveCount(0, {
    timeout: 30000,
  });
  await expect(
    page.getByText(
      "En este momento, Yappy no está disponible. Intenta más tarde.",
      { exact: true },
    ),
  ).toHaveCount(0, { timeout: 20000 });
  await page.evaluate(() => {
    document.querySelector("btn-yappy").eventPayment = () => {
      window.__qaPaymentPresented = true;
    };
  });
  await page.locator("btn-yappy .yappy-button").click();
  await expect(
    page.getByText("Acepta el precio y las condiciones antes de continuar."),
  ).toBeVisible();
  expect(posted).toBe(0);
  await expect(page.locator("btn-yappy .yappy-button")).not.toHaveClass(
    /disable-btn/,
  );
  await page.getByRole("checkbox").check();
  await page.screenshot({
    path: "artifacts/yappy-checkout-mobile.png",
    fullPage: true,
  });
  await page.locator("btn-yappy .yappy-button").click();
  await expect.poll(() => posted).toBe(1);
  await expect(
    page.getByText("Fallo de conexión simulado para QA."),
  ).toBeVisible();
  await expect(page.locator("btn-yappy .yappy-button")).not.toHaveClass(
    /disable-btn/,
  );
  await expect(
    page.getByText(
      "En este momento, Yappy no está disponible. Intenta más tarde.",
      { exact: true },
    ),
  ).toHaveCount(0, { timeout: 20000 });
  await page.evaluate(() => {
    document.querySelector("btn-yappy").eventPayment = () => {
      window.__qaPaymentPresented = true;
    };
  });
  await page.locator("btn-yappy .yappy-button").click();
  await expect.poll(() => posted).toBe(2);
  await expect(
    page.getByText(
      "Esperando la confirmación de Yappy. Puedes volver a esta página para consultar el resultado.",
    ),
  ).toBeVisible();
  await page.evaluate(() =>
    document
      .querySelector("btn-yappy")
      .dispatchEvent(new CustomEvent("eventSuccess")),
  );
  await expect(page.getByText(/Membresía activa hasta/)).toHaveCount(0);
  await expect(page.locator("btn-yappy")).toBeAttached();
  expect(await page.evaluate(() => window.__qaPaymentPresented)).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/yappy-pending-mobile.png",
    fullPage: true,
  });
  const forged = await page.request.get(
    origin +
      "/api/payments/yappy/ipn?orderId=qa123456&status=E&domain=https%3A%2F%2Fwww.rideperks.app&hash=" +
      "0".repeat(64),
  );
  expect(forged.status()).toBe(401);
  console.log(
    "PASS: official button loads, consent required, retry after failed connection, SDK stays mounted, browser success does not activate membership, forged notification rejected. No real payment requests sent.",
  );
} finally {
  if (browser) await browser.close();
  const deleted = await db.auth.admin.deleteUser(id);
  if (deleted.error) throw new Error("QA account cleanup failed");
}
