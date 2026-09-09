"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { CheckCircle2, QrCode, Copy } from "lucide-react";
type Token = { token: string; expires_at: string; status: string };
export default function BenefitCode({
  benefitId,
  verified,
}: {
  benefitId: string;
  verified: boolean;
}) {
  const [code, setCode] = useState<Token | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [seconds, setSeconds] = useState(0),
    [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!code) return;
    const tick = () =>
      setSeconds(
        Math.max(
          0,
          Math.ceil((new Date(code.expires_at).getTime() - Date.now()) / 1000),
        ),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [code]);
  useEffect(() => {
    if (!code || code.status === "used") return;
    const controller = new AbortController();
    const poll = async () => {
      if (document.hidden || new Date(code.expires_at).getTime() <= Date.now())
        return;
      try {
        const res = await fetch("/api/platform/token?token=" + code.token, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "used") {
            setCode((c) => (c ? { ...c, status: "used" } : c));
            setError("");
          }
        }
      } catch {
        /* A temporary network failure does not invalidate the QR. */
      }
    };
    const timer = setInterval(poll, 4000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [code]);
  async function generate() {
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/platform/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ benefit_id: benefitId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No pudimos generar el código.");
        return;
      }
      setCode(data);
    } catch {
      setError(
        "No pudimos conectar. Comprueba tu conexión e intenta nuevamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!verified)
    return (
      <div className="rp-panel rp-qr">
        <QrCode size={30} />
        <h2>Verifica tu cuenta para usarlo</h2>
        <p className="rp-muted">
          Puedes explorar los beneficios mientras revisamos tu perfil de
          conductor.
        </p>
        <Link href="/driver/verify" className="rp-button">
          Verificar mi cuenta
        </Link>
      </div>
    );
  return (
    <section className="rp-panel rp-qr">
      <h2>
        {code?.status === "used"
          ? "Beneficio confirmado"
          : code && seconds > 0
            ? "Muéstralo en el comercio"
            : "¿Ya estás en el comercio?"}
      </h2>
      {code?.status === "used" ? (
        <>
          <CheckCircle2 size={56} color="#216546" />
          <p className="rp-success" role="status">
            El comercio confirmó tu beneficio. Ya está en tu historial.
          </p>
          <Link href="/driver/history" className="rp-button">
            Ver historial
          </Link>
        </>
      ) : code && seconds > 0 ? (
        <>
          <div className="rp-qr-canvas">
            <QRCode
              value={code.token}
              size={220}
              level="M"
              title="Código de un solo uso para este beneficio"
            />
          </div>
          <p className="rp-muted">
            Vence en{" "}
            <strong>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </strong>
          </p>
          <p className="rp-muted">
            Si la cámara no funciona, comparte este código con el comercio:
          </p>
          <code>{code.token}</code>
          <button
            className="rp-text-link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code.token);
                setCopied(true);
              } catch {
                setError("Selecciona y copia el código que aparece arriba.");
              }
            }}
          >
            <Copy size={16} />
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        </>
      ) : (
        <>
          <QrCode size={36} />
          <p className="rp-muted">
            {code
              ? "Tu código venció. Genera uno nuevo cuando te atiendan."
              : "Genera tu código cuando te atiendan. Es válido por dos minutos y se puede usar una sola vez."}
          </p>
          <button
            className="rp-button w-full"
            onClick={generate}
            disabled={busy}
          >
            {busy
              ? "Generando…"
              : code
                ? "Generar nuevo código"
                : "Generar mi código"}
          </button>
        </>
      )}
      {error && (
        <p className="rp-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
