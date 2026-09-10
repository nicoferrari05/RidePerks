"use client";
import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";
type ButtonElement = HTMLElement & {
  eventPayment: (data: {
    transactionId: string;
    token: string;
    documentName: string;
  }) => void;
  isButtonLoading: boolean;
};
type Order = {
  id: string;
  status: string;
  created_at: string;
  amount_cents: number;
};
type Summary = { validUntil: string | null; orders: Order[] };
export default function YappyCheckout({
  phone: initialPhone,
  scriptUrl,
}: {
  phone: string;
  scriptUrl: string;
}) {
  const [phone, setPhone] = useState(
    initialPhone.replace(/^\+?507/, "").replace(/\D/g, ""),
  );
  const [consent, setConsent] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false),
    [summary, setSummary] = useState<Summary | null>(null);
  const [pending, setPending] = useState(false);
  const [buttonVersion, setButtonVersion] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ phone, consent, pending });
  useEffect(() => {
    latest.current = { phone, consent, pending };
  }, [phone, consent, pending]);
  const [observedAt, setObservedAt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const r = await fetch("/api/payments/yappy", { cache: "no-store" });
        if (r.ok && !cancelled) {
          const data = await r.json();
          setSummary(data);
          setObservedAt(Date.now());
          if (data.orders?.[0]?.status === "paid") setMessage("");
          setPending(
            data.orders?.[0]?.status === "pending" &&
              Date.now() - new Date(data.orders[0].created_at).getTime() <
                600000,
          );
        }
      } catch {
        /* Keep the last known state; a network error never confirms payment. */
      }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), pending ? 4000 : 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pending]);
  useEffect(() => {
    if (!ready) return;
    const button = host.current?.querySelector(
      "btn-yappy",
    ) as ButtonElement | null;
    if (!button) return;
    let inFlight = false;
    const captureClick = (event: Event) => {
      if (inFlight || latest.current.pending) return;
      const invalid = !latest.current.consent
        ? "Acepta el precio y las condiciones antes de continuar."
        : !/^6\d{7}$/.test(latest.current.phone)
          ? "Escribe tu número de Yappy de 8 dígitos."
          : "";
      if (invalid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setMessage(invalid);
      }
    };
    const click = async () => {
      if (inFlight) return;
      if (latest.current.pending) {
        setMessage(
          "Ya tienes un pago pendiente. Espera la confirmación de Yappy.",
        );
        return;
      }
      if (!latest.current.consent) {
        setMessage("Acepta el precio y las condiciones antes de continuar.");
        return;
      }
      if (!/^6\d{7}$/.test(latest.current.phone)) {
        setMessage("Escribe tu número de Yappy de 8 dígitos.");
        return;
      }
      inFlight = true;
      setBusy(true);
      setMessage("");
      button.isButtonLoading = true;
      try {
        const r = await fetch("/api/payments/yappy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: latest.current.phone,
            accepted: latest.current.consent,
          }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "No pudimos iniciar el pago.");
        setPending(true);
        button.eventPayment({
          transactionId: data.transactionId,
          token: data.token,
          documentName: data.documentName,
        });
      } catch (e) {
        setMessage(
          e instanceof Error ? e.message : "No pudimos conectar con Yappy.",
        );
        setButtonVersion((v) => v + 1);
      } finally {
        inFlight = false;
        setBusy(false);
        button.isButtonLoading = false;
      }
    };
    const success = () => {
      setPending(true);
      setMessage(
        "Recibimos tu solicitud. Esperamos la confirmación de Yappy; tu membresía se actualizará aquí.",
      );
    };
    const error = () => {
      setMessage(
        "El proceso de Yappy se interrumpió. Revisa el estado del pago antes de intentarlo nuevamente.",
      );
    };
    button.addEventListener("click", captureClick, true);
    button.addEventListener("eventClick", click);
    button.addEventListener("eventSuccess", success);
    button.addEventListener("eventError", error);
    return () => {
      button.removeEventListener("click", captureClick, true);
      button.removeEventListener("eventClick", click);
      button.removeEventListener("eventSuccess", success);
      button.removeEventListener("eventError", error);
    };
  }, [ready, buttonVersion]);
  const active =
    summary?.validUntil && new Date(summary.validUntil).getTime() > observedAt;
  const renew =
    !active ||
    new Date(summary!.validUntil!).getTime() < observedAt + 7 * 86400000;
  const labels: Record<string, string> = {
    pending: "Pendiente de confirmación",
    paid: "Pagado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    expired: "Vencido",
  };
  return (
    <div className="rp-stack">
      <Script
        src={scriptUrl}
        type="module"
        onReady={() =>
          void customElements
            .whenDefined("btn-yappy")
            .then(() => setReady(true))
        }
        onError={() =>
          setMessage(
            "No pudimos cargar Yappy. Recarga la página para intentar nuevamente.",
          )
        }
      />
      {active && (
        <p className="rp-success" role="status">
          Membresía activa hasta el{" "}
          {new Date(summary!.validUntil!).toLocaleDateString("es-PA", {
            timeZone: "America/Panama",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      )}
      {renew && (
        <section className="rp-panel rp-stack">
          <h2>{active ? "Renueva tu membresía" : "Activa tu membresía"}</h2>
          <div className="rp-field">
            <label htmlFor="yappy-phone">Tu número de Yappy</label>
            <input
              id="yappy-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={8}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="60000000"
              disabled={busy || pending}
            />
          </div>
          <label className="rp-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy || pending}
            />
            <span>
              Acepto pagar $15.00 por un mes de membresía. La renovación es
              manual y no hay cargos automáticos.
            </span>
          </label>
          {pending && (
            <p role="status">
              Esperando la confirmación de Yappy. Puedes volver a esta página
              para consultar el resultado.
            </p>
          )}
          <div ref={host}>
            {createElement("btn-yappy", {
              key: buttonVersion,
              theme: "orange",
            })}
          </div>
          {!ready && !pending && <p className="rp-muted">Cargando Yappy…</p>}
        </section>
      )}
      {message && (
        <p className="rp-muted" role="status">
          {message}
        </p>
      )}
      {!!summary?.orders.length && (
        <section>
          <h2 className="mb-4">Tus pagos</h2>
          <div className="rp-list">
            {summary.orders.map((o) => (
              <div className="rp-list-row" key={o.id}>
                <div>
                  <strong>$15.00 · {labels[o.status] || o.status}</strong>
                  <p className="rp-muted">
                    {new Date(o.created_at).toLocaleDateString("es-PA")} · Ref.{" "}
                    {o.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
