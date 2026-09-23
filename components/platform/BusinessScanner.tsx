"use client";
import { useRef, useState, useEffect } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
type Result = {
  driver_name: string;
  benefit_title: string;
  discount_label: string;
  terms?: string;
  expires_at?: string;
};
type Scanner = { stop: () => Promise<void>; clear: () => void };
export default function BusinessScanner() {
  const [token, setToken] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<Result | null>(null),
    [camera, setCamera] = useState(false);
  const [preview, setPreview] = useState<Result | null>(null);
  const scanner = useRef<Scanner | null>(null);
  useEffect(
    () => () => {
      const s = scanner.current;
      if (s)
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
    },
    [],
  );
  async function stop() {
    const s = scanner.current;
    scanner.current = null;
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {}
    }
    setCamera(false);
  }
  async function start() {
    setError("");
    setCamera(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("rp-scanner");
      scanner.current = s;
      await s.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (text) => {
          setToken(text.trim());
          setPreview(null);
          void stop();
        },
        () => {},
      );
    } catch {
      setError(
        "No pudimos abrir la cámara. Permite el acceso o pega el código del conductor.",
      );
      await stop();
    }
  }
  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        preview ? "/api/platform/redeem" : "/api/platform/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No pudimos validar el código.");
        return;
      }
      if (preview) {
        setResult(data);
        setToken("");
        setPreview(null);
      } else setPreview(data);
    } catch {
      setError(
        "No pudimos conectar. Revisa tu conexión y vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rp-stack">
      <div className="rp-panel rp-stack">
        <h2>Validar un beneficio</h2>
        <p className="rp-muted">
          Escanea el QR o escribe el código de 6 caracteres que te dicte el
          conductor. Confirma únicamente cuando vayas a aplicar el descuento.
        </p>
        <div
          id="rp-scanner"
          style={{ display: camera ? "block" : "none", width: "100%" }}
        />
        {camera ? (
          <button className="rp-button secondary" onClick={stop}>
            Cerrar cámara
          </button>
        ) : (
          <button className="rp-button secondary" onClick={start}>
            <Camera size={20} />
            Escanear QR
          </button>
        )}
        <form onSubmit={redeem} className="rp-form">
          <div className="rp-field">
            <label htmlFor="token">Código del conductor</label>
            <input
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setPreview(null);
              }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Ej: F3A9B2"
              required
              maxLength={36}
            />
          </div>
          {error && (
            <p className="rp-error" role="alert">
              {error}
            </p>
          )}
          {preview && (
            <section className="rp-stack" aria-live="polite">
              <h3>{preview.driver_name}</h3>
              <p>
                <strong>{preview.benefit_title}</strong> ·{" "}
                {preview.discount_label}
              </p>
              <p className="rp-muted whitespace-pre-line">{preview.terms}</p>
              <p className="rp-muted">
                Acceso válido al consultar. Se comprobará nuevamente al
                confirmar.
              </p>
            </section>
          )}
          <button className="rp-button" disabled={busy || !token}>
            {busy
              ? "Consultando…"
              : preview
                ? "Confirmar y aplicar beneficio"
                : "Consultar beneficio"}
          </button>
        </form>
      </div>
      {result && (
        <div className="rp-panel rp-stack" role="status">
          <CheckCircle2 size={32} className="text-[var(--rp-accent-text)]" />
          <h2>Beneficio confirmado</h2>
          <p>
            <strong>{result.driver_name}</strong>
            <br />
            {result.benefit_title}
          </p>
          <p className="rp-success">Aplica: {result.discount_label}</p>
          <p className="rp-muted">
            Este código quedó registrado y no se puede volver a usar.
          </p>
        </div>
      )}
    </div>
  );
}
