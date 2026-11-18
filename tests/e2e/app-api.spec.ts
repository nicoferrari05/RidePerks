import { test, expect } from "@playwright/test";

// The phone app's entry (/api/app/*). Only paths that never reach a real
// account run here: .env.local may point at production data.
test("app routes refuse requests without a valid session", async ({ request }) => {
  for (const headers of [
    {} as Record<string, string>,
    { Authorization: "Bearer not-a-real-token" },
    { Authorization: "Basic abc" },
  ]) {
    const response = await request.get("/api/app/me", { headers });
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({ error: "Inicia sesión de nuevo." });
  }
});

test("app sign-in validates before touching any account", async ({ request }) => {
  for (const data of [
    {},
    { email: "no-es-correo", password: "x" },
    { email: "persona@example.com", password: "" },
    { email: "persona@example.com", password: "a".repeat(129) },
  ]) {
    const response = await request.post("/api/app/auth/login", { data });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      error: "Revisa tu correo y contraseña.",
    });
  }
  const broken = await request.post("/api/app/auth/login", {
    headers: { "Content-Type": "application/json" },
    data: "{not json",
  });
  expect(broken.status()).toBe(400);
});

test("app counter and PIN routes refuse without a business or a valid PIN", async ({ request }) => {
  const preview = await request.post("/api/app/business/preview", { data: { token: "ABC123" } });
  expect(preview.status()).toBe(401);
  expect(await preview.json()).toEqual({ error: "Inicia sesión como comercio." });
  const pin = await request.post("/api/app/pin/session", { data: { pin: "12" } });
  expect(pin.status()).toBe(400);
  expect(await pin.json()).toEqual({ error: "Escribe el PIN de tu comercio (de 6 a 8 números)." });
  const redeem = await request.post("/api/app/pin/redeem", {
    headers: { "X-RP-Pin": "p1.not-a-session" },
    data: { token: "ABC123" },
  });
  expect(redeem.status()).toBe(401);
  for (const path of ["/api/app/business/home", "/api/app/business/activity", "/api/app/pin/session"])
    expect((await request.get(path)).status()).toBe(401);
});
