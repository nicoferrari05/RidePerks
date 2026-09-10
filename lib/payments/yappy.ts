import "server-only";
import { YAPPY_API, MEMBERSHIP_AMOUNT } from "./yappy-protocol";
export function yappyConfig() {
  const merchantId = process.env.YAPPY_MERCHANT_ID;
  const secret = process.env.YAPPY_SECRET_KEY;
  const domain = process.env.YAPPY_DOMAIN;
  if (process.env.YAPPY_ENABLED !== "true" || !merchantId || !secret || !domain)
    return null;
  if (!["https://rideperks.app", "https://www.rideperks.app"].includes(domain))
    return null;
  return { merchantId, secret, domain };
}
async function call(path: string, body: object, token?: string) {
  const response = await fetch(YAPPY_API + path, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok || data?.status?.code !== "0000" || !data.body)
    throw new Error(
      "Yappy no pudo procesar la solicitud. Revisa el estado antes de volver a pagar.",
    );
  return data.body;
}
export async function createYappyPayment(orderId: string, phone: string) {
  const config = yappyConfig();
  if (!config) throw new Error("El pago con Yappy aún no está habilitado.");
  const session = await call("/payments/validate/merchant", {
    merchantId: config.merchantId,
    urlDomain: config.domain,
  });
  if (
    typeof session.token !== "string" ||
    !Number.isFinite(Number(session.epochTime))
  )
    throw new Error("No pudimos validar la conexión con Yappy.");
  const result = await call(
    "/payments/payment-wc",
    {
      merchantId: config.merchantId,
      orderId,
      domain: config.domain,
      paymentDate: session.epochTime,
      aliasYappy: phone,
      ipnUrl: config.domain + "/api/payments/yappy/ipn",
      discount: "0.00",
      taxes: "0.00",
      subtotal: MEMBERSHIP_AMOUNT,
      total: MEMBERSHIP_AMOUNT,
    },
    session.token,
  );
  if (
    ![result.token, result.documentName, result.transactionId].every(
      (v) => typeof v === "string" && v.length > 0,
    )
  )
    throw new Error(
      "La respuesta de Yappy no está completa. Revisa el estado antes de volver a pagar.",
    );
  return {
    token: result.token as string,
    documentName: result.documentName as string,
    transactionId: result.transactionId as string,
  };
}
