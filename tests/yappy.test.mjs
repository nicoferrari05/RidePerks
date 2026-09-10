import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  verifyYappyNotification,
  MEMBERSHIP_CENTS,
} from "../lib/payments/yappy-protocol.ts";
const key = "test-only-key",
  secret = Buffer.from(key + ".merchant-test").toString("base64"),
  domain = "https://www.rideperks.app";
function signed(status = "E") {
  const orderId = "0123456789abcd";
  return new URLSearchParams({
    orderId,
    status,
    domain,
    hash: createHmac("sha256", key)
      .update(orderId + status + domain)
      .digest("hex"),
  });
}
test("Yappy accepts valid signatures for every documented status", () => {
  for (const s of ["E", "R", "C", "X"])
    assert.equal(verifyYappyNotification(signed(s), secret, domain)?.status, s);
  assert.equal(MEMBERSHIP_CENTS, 1500);
});
test("Yappy rejects tampered orders, states, domains and duplicated parameters", () => {
  for (const field of ["orderId", "status", "domain", "hash"]) {
    const p = signed();
    p.set(field, p.get(field) + "x");
    assert.equal(verifyYappyNotification(p, secret, domain), null);
    const dup = signed();
    dup.append(field, dup.get(field));
    assert.equal(verifyYappyNotification(dup, secret, domain), null);
  }
  assert.equal(
    verifyYappyNotification(
      signed(),
      Buffer.from("wrong.key").toString("base64"),
      domain,
    ),
    null,
  );
  assert.equal(
    verifyYappyNotification(signed(), secret, "https://rideperks.app"),
    null,
  );
});
