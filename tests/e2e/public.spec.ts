import { test, expect } from "@playwright/test";
test("landing keeps waitlist and links to driver login", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Iniciar sesión" }),
  ).toBeVisible();
  await expect(page.locator("#waitlist")).toBeAttached();
  await page.getByRole("link", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Qué bueno",
  );
});
for (const width of [320, 375, 430, 1440]) {
  test("auth screens fit viewport " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/login",
      "/register",
      "/recover",
      "/business/login",
      "/business/register",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const fields = page.locator(
        "input:not([type=hidden]):not([type=checkbox])",
      );
      for (let i = 0; i < (await fields.count()); i++)
        expect(
          await fields
            .nth(i)
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
        ).toBeGreaterThanOrEqual(16);
      await page.screenshot({
        path:
          "artifacts/" +
          path.slice(1).replaceAll("/", "-") +
          "-" +
          width +
          ".png",
        fullPage: true,
      });
    }
  });
}
test("protected routes redirect without exposing page data", async ({
  page,
}) => {
  for (const path of [
    "/driver/dashboard",
    "/driver/verify",
    "/driver/history",
    "/business",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
  await page.goto("/admin/platform");
  await expect(page).toHaveURL(/\/admin\/login/);
});
test("unauthenticated API rejects token and redemption requests", async ({
  request,
}) => {
  for (const path of ["/api/platform/token", "/api/platform/redeem"]) {
    const response = await request.post(path, {
      headers: { Origin: process.env.TEST_BASE_URL || "http://localhost:3100" },
      data: {
        benefit_id: "00000000-0000-4000-8000-000000000000",
        token: "00000000-0000-4000-8000-000000000000",
      },
    });
    expect(response.status()).toBe(401);
  }
});
test("cross-site mutations are rejected", async ({ request }) => {
  for (const path of [
    "/api/platform/token",
    "/api/platform/redeem",
    "/api/admin/login",
  ]) {
    const response = await request.post(path, {
      headers: { Origin: "https://attacker.invalid" },
      data: { password: "irrelevant" },
    });
    expect(response.status()).toBe(403);
  }
});
test("password toggle and registration constraints work", async ({ page }) => {
  await page.goto("/register");
  const password = page.getByLabel("Contraseña", { exact: true });
  await password.fill("long-passphrase");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Crear mi cuenta gratis" }).click();
  await expect(page).toHaveURL(/\/register/);
  expect(
    await page
      .locator("form")
      .evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
});
test("legal pages and offline fallback render", async ({ page, request }) => {
  for (const path of ["/terminos", "/privacidad", "/offline.html"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).start_url).toBe("/driver/dashboard");
});

test("landing redesign and merchant entry are visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByText("Carlos Rodriguez", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("heading", { name: "Tus beneficios, a mano." }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/landing-hero-new.png" });
  await page.locator("#beneficios").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/landing-benefits-new.png" });
  await page.goto("/business/register");
  await expect(page.locator("[name=platform]")).toHaveCount(0);
  await expect(page.getByLabel("Nombre del responsable")).toBeVisible();
  await page.getByRole("link", { name: "Conductor", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
});
