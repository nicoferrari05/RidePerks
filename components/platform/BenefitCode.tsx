"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { CheckCircle2, QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
type Token = {
  token: string;
  short_code?: string;
  expires_at: string;
  status: string;
};
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
      <section className="rp-qr">
        <QrCode size={32} aria-hidden="true" />
        <h2>Verifica tu cuenta para usarlo</h2>
        <p className="rp-muted">
          Mientras revisamos tu perfil puedes explorar los beneficios.
        </p>
        <Link
          href="/driver/verify"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Verificar mi cuenta
        </Link>
      </section>
    );
  return (
    <section className="rp-qr" aria-live="polite">
      {code?.status === "used" ? (
        <>
          <CheckCircle2
            size={48}
            className="text-[var(--rp-green-text)]"
            aria-hidden="true"
          />
          <h2>Beneficio confirmado</h2>
          <p className="rp-muted">El comercio lo registró en tu actividad.</p>
          <Link
            href="/driver/history"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "w-full",
            })}
          >
            Ver actividad
          </Link>
        </>
      ) : code && seconds > 0 ? (
        <>
          <h2>Muéstralo en el comercio</h2>
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
            . Si la cámara falla, dicta este código:
          </p>
          <code className="rp-short-code">{code.short_code || code.token}</code>
          <Button
            variant="ghost"
            size="md"
            leftIcon={<Copy aria-hidden="true" />}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  code.short_code || code.token,
                );
                setCopied(true);
              } catch {
                setError("Selecciona y copia el código que aparece arriba.");
              }
            }}
          >
            {copied ? "Código copiado" : "Copiar código"}
          </Button>
        </>
      ) : (
        <>
          <h2>{code ? "Tu código venció" : "¿Ya estás en el comercio?"}</h2>
          <p className="rp-muted">
            {code
              ? "Genera uno nuevo cuando te atiendan."
              : "Genera tu código cuando te atiendan. Dura dos minutos y sirve una sola vez."}
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={generate}
            loading={busy}
          >
            {code ? "Generar nuevo código" : "Generar mi código"}
          </Button>
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
