import { createHmac, timingSafeEqual } from "node:crypto";
export const MEMBERSHIP_AMOUNT = "15.00";
export const MEMBERSHIP_CENTS = 1500;
export const YAPPY_API = "https://apipagosbg.bgeneral.cloud";
export const YAPPY_SCRIPT =
  "https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js";
export function verifyYappyNotification(
  params: URLSearchParams,
  secret: string,
  expectedDomain: string,
) {
  for (const key of ["orderId", "status", "domain", "hash"])
    if (params.getAll(key).length !== 1) return null;
  const orderId = params.get("orderId")!,
    status = params.get("status")!,
    domain = params.get("domain")!,
    hash = params.get("hash")!;
  if (
    !/^[a-zA-Z0-9]{1,15}$/.test(orderId) ||
    !/^[ERCX]$/.test(status) ||
    domain !== expectedDomain ||
    !/^[0-9a-f]{64}$/i.test(hash)
  )
    return null;
  try {
    const decoded = Buffer.from(secret, "base64").toString("utf8");
    const key = decoded.split(".")[0];
    if (!key || !decoded.includes(".")) return null;
    const signature = createHmac("sha256", key)
      .update(orderId + status + domain)
      .digest();
    if (!timingSafeEqual(signature, Buffer.from(hash, "hex"))) return null;
    return { orderId, status, domain };
  } catch {
    return null;
  }
}
