"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2 } from "lucide-react";
type Result = {
  driver_name: string;
  benefit_title: string;
  discount_label: string;
  terms?: string;
  expires_at?: string;
};
type Scanner = { stop: () => Promise<void>; clear: () => void };
// Account mode (owner/staff): consult first, then confirm. PIN mode (on-site
// staff without an account): the camera opens on arrival and a scan
// registers the use immediately.
export default function BusinessScanner({ pin = false }: { pin?: boolean }) {
  const router = useRouter();
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
  useEffect(() => {
    if (!pin) return;
    // Deferred so React's development double-mount doesn't open it twice.
    const timer = setTimeout(() => void start(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);
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
    setResult(null);
    setCamera(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("rp-scanner");
      scanner.current = s;
      await s.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (text) => {
          // The library keeps firing until stopped; act on the first read.
          if (scanner.current !== s) return;
          void stop();
          setToken(text.trim());
          setPreview(null);
          if (pin) void submit(text.trim());
        },
        () => {},
      );
    } catch {
      setError(
        "No pudimos abrir la cámara. Permite el acceso o escribe el código del conductor.",
      );
      await stop();
    }
  }
  async function submit(value: string) {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        pin
          ? "/api/pin/redeem"
          : preview
            ? "/api/platform/redeem"
            : "/api/platform/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: value.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No pudimos validar el código.");
        // The PIN was changed or removed: back to the PIN screen.
        if (pin && res.status === 401) router.refresh();
        return;
      }
      if (pin || preview) {
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
  const done = result && (
    <div className="rp-panel rp-stack" role="status">
      <CheckCircle2 size={32} className="text-[var(--rp-accent-text)]" />
      <h2>{pin ? "Canje registrado" : "Beneficio confirmado"}</h2>
      <p>
        <strong>{result.driver_name}</strong>
        <br />
        {result.benefit_title}
      </p>
      <p className="rp-success">Aplica: {result.discount_label}</p>
      {pin && result.terms && (
        <p className="rp-muted whitespace-pre-line">{result.terms}</p>
      )}
      <p className="rp-muted">
        Este código quedó registrado y no se puede volver a usar.
      </p>
    </div>
  );
  return (
    <div className="rp-stack">
      {pin && done}
      <div className="rp-panel rp-stack">
        <h2>Validar un beneficio</h2>
        <p className="rp-muted">
          {pin
            ? "Apunta la cámara al QR del conductor. El canje se registra al leerlo. Si la cámara falla, escribe el código de 6 caracteres."
            : "Escanea el QR o escribe el código de 6 caracteres que te dicte el conductor. Confirma únicamente cuando vayas a aplicar el descuento."}
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
          <button
            className={"rp-button" + (pin ? "" : " secondary")}
            onClick={start}
            disabled={busy}
          >
            <Camera size={20} />
            {pin && result ? "Escanear otro QR" : "Escanear QR"}
          </button>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(token);
          }}
          className="rp-form"
        >
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
          <button
            className={"rp-button" + (pin ? " secondary" : "")}
            disabled={busy || !token}
          >
            {busy
              ? pin
                ? "Registrando…"
                : "Consultando…"
              : pin
                ? "Registrar canje"
                : preview
                  ? "Confirmar y aplicar beneficio"
                  : "Consultar beneficio"}
          </button>
        </form>
      </div>
      {!pin && done}
    </div>
  );
}
