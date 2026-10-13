import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { safeNext, signupSchema } from "../lib/platform/validation.ts";
import {
  createSessionToken,
  verifySessionToken,
  verifyPassword,
} from "../lib/adminAuth.ts";
import {
  hashPin,
  pinProblem,
  createPinSession,
  readPinSession,
} from "../lib/pinAuth.ts";
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
test("business PINs reject easy guesses and hash with the server secret", () => {
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  for (const weak of [
    "12345",
    "123456789",
    "12a456",
    "000000",
    "123456",
    "98765432",
  ])
    assert.notEqual(pinProblem(weak), null, weak);
  for (const ok of ["482913", "4829130", "90817264"])
    assert.equal(pinProblem(ok), null, ok);
  const hash = hashPin("482913");
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hashPin("482913"), hash);
  assert.notEqual(hashPin("482914"), hash);
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  assert.notEqual(hashPin("482913"), hash);
});
test("PIN sessions carry business and version, and resist tampering", () => {
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  const business = "8f14e45f-ceea-4e7a-9f6a-2b5c1d3e4f50";
  const token = createPinSession(business, 3);
  assert.deepEqual(readPinSession(token), { businessId: business, version: 3 });
  const parts = token.split(".");
  for (const [i, value] of [
    [1, "00000000-0000-4000-8000-000000000000"],
    [2, "4"],
    [3, "1"],
    [4, "0".repeat(64)],
  ]) {
    const forged = [...parts];
    forged[i] = value;
    assert.equal(readPinSession(forged.join(".")), null);
  }
  assert.equal(readPinSession(undefined), null);
  assert.equal(readPinSession("p1.x"), null);
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  assert.equal(readPinSession(token), null);
});
