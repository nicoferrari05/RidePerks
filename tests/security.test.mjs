import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { safeNext, signupSchema } from "../lib/platform/validation.ts";
import {
  createSessionToken,
  verifySessionToken,
  verifyPassword,
} from "../lib/adminAuth.ts";
test("redirect destinations cannot leave driver/business routes", () => {
  for (const url of [
    "https://example.com",
    "//example.com",
    "/driver\\evil",
    "/driverx",
    "javascript:alert(1)",
    "/admin",
    "/driver\nheader",
  ])
    assert.equal(safeNext(url), "/driver/dashboard");
  assert.equal(safeNext("/driver/password"), "/driver/password");
  assert.equal(safeNext("/business"), "/business");
});
test("signup strips arbitrary role and rejects missing consent", () => {
  const base = {
    email: "DRIVER@example.com",
    password: "valid-password",
    full_name: "Test Driver",
    phone: "+507 61234567",
    platform: "uber",
    terms: "on",
    role: "admin",
    status: "verified",
  };
  const result = signupSchema.parse(base);
  assert.equal(result.email, "driver@example.com");
  assert.equal(result.role, undefined);
  assert.equal(signupSchema.safeParse({ ...base, terms: "" }).success, false);
});
test("administrator tokens expire, resist tampering and rotate with secret", async () => {
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.ADMIN_PASSWORD = "test-secret";
  const token = await createSessionToken();
  assert.equal(await verifySessionToken(token), true);
  assert.equal(await verifySessionToken(token + "x"), false);
  assert.equal(await verifySessionToken(undefined), false);
  const parts = token.split(".");
  parts[1] = "1";
  assert.equal(await verifySessionToken(parts.join(".")), false);
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  assert.equal(await verifySessionToken(token), false);
  assert.equal(await verifyPassword("wrong"), false);
  assert.equal(await verifyPassword("test-secret"), true);
});
