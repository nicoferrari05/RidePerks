import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
process.loadEnvFile(".env.local");
const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);
const run = randomUUID(),
  password = "Rp-upgrade-" + randomUUID(),
  origin = process.env.TEST_BASE_URL || "http://localhost:3100";
const users: string[] = [];
let shop = "",
  benefit = "";
const email = (role: string) =>
  "rp-upgrade-" + role + "-" + run + "@example.com";
async function login(page: Page, role: string) {
  await page.goto(role === "driver" ? "/login" : "/business/login");
  await page.getByLabel("Correo electrónico").fill(email(role));
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/business$|driver\/dashboard$/);
}
test.beforeAll(async () => {
  const check = await db.from("rp_access_grants").select("id").limit(1);
  if (check.error)
    throw new Error(
      "Apply ACTUALIZAR_COMERCIOS_Y_ACCESOS.sql before running management tests.",
    );
  for (const role of ["owner", "staff", "driver"]) {
    const r = await db.auth.admin.createUser({
      email: email(role),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "QA " + role + " " + run.slice(0, 6),
        phone: "+507 60000000",
        platform: "uber",
      },
    });
    if (r.error) throw r.error;
    users.push(r.data.user.id);
    const update = await db
      .from("rp_profiles")
      .update({
        role: role === "driver" ? "driver" : "business",
        status: "verified",
      })
      .eq("id", r.data.user.id);
    if (update.error) throw update.error;
  }
  const s = await db.rpc("rp_save_business", {
    p_id: null,
    p_values: {
      name: "QA Gestión " + run.slice(0, 6),
      description: "Prueba temporal",
      address: "Panamá QA",
      category: "comida",
      owner_user_id: users[0],
    },
  });
  if (s.error) throw s.error;
  shop = s.data;
  const m = await db.from("rp_memberships").insert({
    driver_id: users[2],
    valid_until: new Date(Date.now() + 86400000).toISOString(),
  });
  if (m.error) throw m.error;
});
test.afterAll(async () => {
  if (shop) {
    for (const t of [
      "rp_redemptions",
      "rp_benefit_revisions",
      "rp_business_invites",
      "rp_business_members",
    ])
      await db.from(t).delete().eq("business_id", shop);
  }
  if (users[2]) {
    for (const t of [
      "rp_qr_tokens",
      "rp_access_controls",
      "rp_access_grants",
      "rp_memberships",
      "rp_payment_orders",
    ])
      await db.from(t).delete().eq("driver_id", users[2]);
  }
  if (shop) {
    await db.from("rp_benefits").delete().eq("business_id", shop);
    await db.from("rp_businesses").delete().eq("id", shop);
    await db.from("rp_admin_audit").delete().eq("subject_id", shop);
  }
  if (users[0]) {
    await db.from("rp_admin_audit").delete().eq("actor_id", users[0]);
    await db.from("rp_admin_users").delete().eq("user_id", users[0]);
  }
  for (const id of users) {
    for (const key of ["redeem:", "token:", "staff-invite:", "invite-accept:"])
      await db
        .from("rp_rate_limits")
        .delete()
        .eq("key", key + id);
    const result = await db.auth.admin.deleteUser(id);
    expect(result.error).toBeNull();
  }
});
test("merchant approval, staff invitation and redemption, dashboard, chips and manual access", async ({
  browser,
}) => {
  const ownerContext = await browser.newContext(),
    staffContext = await browser.newContext(),
    driverContext = await browser.newContext();
  const owner = await ownerContext.newPage(),
    staff = await staffContext.newPage(),
    driver = await driverContext.newPage();
  await login(owner, "owner");
  await owner.getByText("Crear un beneficio", { exact: true }).click();
  const form = owner
    .locator("form")
    .filter({ has: owner.getByRole("button", { name: "Enviar a aprobación" }) })
    .first();
  await form
    .getByLabel("Nombre del beneficio")
    .fill("Beneficio gestión " + run.slice(0, 6));
  await form.getByLabel("Descuento o beneficio ofrecido").fill("Ahorra 3 USD");
  await form
    .getByLabel("Descripción", { exact: true })
    .fill("Oferta de prueba de gestión");
  await form
    .getByRole("combobox", { name: "Categoría", exact: true })
    .selectOption("comida");
  await form
    .getByLabel("Términos, condiciones y restricciones")
    .fill("Solo prueba automatizada. No válido comercialmente.");
  await form.getByLabel("Ahorro fijo por uso, USD (opcional)").fill("3");
  await form.getByRole("button", { name: "Enviar a aprobación" }).click();
  await expect(
    owner.getByText("Pendiente de aprobación", { exact: true }),
  ).toBeVisible();
  expect(
    (await db.from("rp_benefits").select("id").eq("business_id", shop)).data,
  ).toHaveLength(0);
  const adminLogin = await owner.request.post("/api/admin/login", {
    headers: { Origin: origin },
    data: { password: process.env.ADMIN_PASSWORD },
  });
  expect(adminLogin.ok()).toBe(true);
  await owner.goto("/admin/access");
  await owner.locator("summary").click();
  await owner
    .getByRole("button", { name: "Vincular mi identidad administrativa" })
    .click();
  await expect(owner.getByRole("status")).toContainText("Identidad vinculada");
  await owner.goto("/admin/reviews");
  const proposal = owner
    .locator("article")
    .filter({ hasText: "Beneficio gestión " + run.slice(0, 6) });
  await proposal.getByRole("button", { name: "Aprobar propuesta" }).click();
  await expect(proposal).toHaveCount(0);
  benefit = (
    await db.from("rp_benefits").select("id").eq("business_id", shop).single()
  ).data!.id;
  await owner.goto("/business");
  await owner
    .getByRole("button", { name: "Crear invitación para personal" })
    .click();
  const invite = await owner.getByLabel("Enlace de invitación").inputValue();
  await login(staff, "staff");
  await staff.goto(invite);
  await staff
    .getByRole("button", { name: "Aceptar acceso como personal" })
    .click();
  await expect(staff).toHaveURL(/business$/);
  await expect(
    staff.getByRole("heading", { name: "Personal autorizado" }),
  ).toHaveCount(0);
  await expect(staff.getByText("Facturación", { exact: true })).toHaveCount(0);
  await expect(
    staff.getByText("Crear un beneficio", { exact: true }),
  ).toHaveCount(0);
  await login(driver, "driver");
  await driver.goto("/driver/benefits");
  await expect(driver.getByRole("searchbox")).toHaveCount(0);
  await expect(driver.getByRole("combobox")).toHaveCount(0);
  await driver.getByRole("button", { name: "Comida", exact: true }).click();
  await expect(
    driver.getByRole("button", { name: "Comida", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    driver.locator('a[href="/driver/benefits/' + benefit + '"]'),
  ).toBeVisible();
  const issued = await driver.request.post("/api/platform/token", {
    headers: { Origin: origin },
    data: { benefit_id: benefit },
  });
  expect(issued.ok()).toBe(true);
  const code = await issued.json();
  await staff.getByLabel("Código del conductor").fill(code.short_code);
  await staff.getByRole("button", { name: "Consultar beneficio" }).click();
  await expect(
    staff.getByText("QA driver " + run.slice(0, 6), { exact: true }),
  ).toBeVisible();
  await staff
    .getByRole("button", { name: "Confirmar y aplicar beneficio" })
    .click();
  await expect(
    staff.getByRole("heading", { name: "Beneficio confirmado" }),
  ).toBeVisible();
  const redeemed = await db
    .from("rp_redemptions")
    .select("redeemed_by")
    .eq("business_id", shop)
    .single();
  expect(redeemed.data?.redeemed_by).toBe(users[1]);
  await owner.goto("/business");
  await expect(owner.locator("dl")).toContainText(/3[.,]00/);
  for (const width of [375, 1440]) {
    await owner.setViewportSize({ width, height: 900 });
    await owner.screenshot({
      path: "artifacts/merchant-management-" + width + ".png",
      fullPage: true,
    });
    expect(
      await owner.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await owner.goto("/admin/access?driver=" + users[2]);
  await owner
    .getByRole("combobox", { name: "Tipo de acceso" })
    .selectOption("lifetime");
  await owner
    .getByLabel("Motivo", { exact: true })
    .fill("Prueba automatizada de acceso permanente");
  await owner.getByRole("button", { name: "Aplicar cambio de acceso" }).click();
  await expect(owner.getByRole("status")).toContainText("Acceso actualizado");
  await driver.goto("/driver/membership");
  await expect(
    driver.getByRole("heading", { name: "Tienes acceso permanente" }),
  ).toBeVisible();
  await owner
    .getByRole("combobox", { name: "Acción", exact: true })
    .selectOption("suspend");
  await owner
    .getByLabel("Motivo", { exact: true })
    .fill("Suspensión de prueba automatizada");
  await owner.getByRole("button", { name: "Aplicar cambio de acceso" }).click();
  await expect(
    owner.getByText("Estado: Suspendido", { exact: false }),
  ).toBeVisible();
  const blocked = await driver.request.post("/api/platform/token", {
    headers: { Origin: origin },
    data: { benefit_id: benefit },
  });
  expect(blocked.status()).toBe(400);
  await owner.goto("/business");
  await owner.getByRole("button", { name: "Retirar acceso" }).click();
  await expect(
    owner.getByRole("button", { name: "Retirar acceso" }),
  ).toHaveCount(0);
  await staff.reload();
  await expect(
    staff.getByRole("heading", { name: "Validar un beneficio" }),
  ).toHaveCount(0);
  await ownerContext.close();
  await staffContext.close();
  await driverContext.close();
});
