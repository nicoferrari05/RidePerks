"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { CheckIcon, CopyIcon, WhatsAppIcon } from "./icons";

type Platform = "uber" | "indrive" | "pedidosya" | "multiple";
type Status = "idle" | "loading" | "submitting" | "success" | "error";

type Tone = "light" | "dark";

type SuccessInfo = {
  referralCode: string;
  position: number | null;
  referralCount: number;
};

const STORAGE_KEY = "rp_waitlist_code";

const PLATFORM_LABEL: Record<Platform, string> = {
  uber: "Uber",
  indrive: "InDrive",
  pedidosya: "PedidosYa",
  multiple: "Varias plataformas",
};

function fieldClass(tone: Tone) {
  return tone === "dark"
    ? "w-full rounded-xl border border-white/10 bg-navy-2 px-4 py-3 text-[15px] text-bone placeholder:text-bone/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-150 ease-out focus-visible:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
    : "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-mute transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";
}

export default function WaitlistForm({ tone = "light" }: { tone?: Tone }) {
  const nameId = useId();
  const emailId = useId();
  const whatsappId = useId();
  const platformId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [platform, setPlatform] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [copied, setCopied] = useState(false);

  // Pick up ?ref=CODE from the URL (pure client-side, no SSR needed) and
  // check whether this browser already joined — if so, skip straight to
  // the confirmation/share view instead of showing the form again.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);

    const savedCode = window.localStorage.getItem(STORAGE_KEY);
    if (!savedCode) {
      setStatus("idle");
      return;
    }

    fetch(`/api/waitlist/me?code=${encodeURIComponent(savedCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSuccess({
            referralCode: savedCode,
            position: data.position ?? null,
            referralCount: data.referralCount ?? 0,
          });
          setStatus("success");
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
          setStatus("idle");
        }
      })
      .catch(() => setStatus("idle"));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, whatsapp, platform, ref: refCode }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data?.error ?? "Algo salió mal. Intenta de nuevo.");
        return;
      }

      window.localStorage.setItem(STORAGE_KEY, data.referralCode);
      setSuccess({
        referralCode: data.referralCode,
        position: data.position ?? null,
        referralCount: data.referralCount ?? 0,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("No pudimos conectar. Revisa tu internet e intenta de nuevo.");
    }
  }

  async function handleCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the link is still selectable/visible.
    }
  }

  if (status === "loading") {
    return <div className="h-[280px] w-full max-w-md" aria-hidden="true" />;
  }

  if (status === "success" && success) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?ref=${success.referralCode}`;
    const shareText = `Me uní a la lista de espera de RidePerks, el club de beneficios para conductores. Únete con mi link: ${link}`;

    return (
      <div
        role="status"
        className={`w-full max-w-md rounded-3xl border p-6 shadow-[0_20px_60px_-30px_rgba(4,20,41,0.4)] transition-all duration-300 ease-out ${
          tone === "dark" ? "border-white/10 bg-navy-2 text-bone" : "border-line bg-white text-navy"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-verde text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold">Listo, ya estás en la lista.</p>
            {success.position != null && (
              <p className={`text-sm ${tone === "dark" ? "text-bone/60" : "text-mute"}`}>
                Eres el número{" "}
                <span className="font-mono font-semibold text-ember">{success.position}</span> en la
                fila.
              </p>
            )}
          </div>
        </div>

        <div className={`mt-5 border-t pt-5 ${tone === "dark" ? "border-white/10" : "border-line"}`}>
          <p className="text-sm font-medium">Invita a otros conductores para subir en la fila.</p>
          {success.referralCount > 0 && (
            <p className={`mt-1 text-xs ${tone === "dark" ? "text-bone/50" : "text-mute"}`}>
              {success.referralCount} {success.referralCount === 1 ? "persona ya se unió" : "personas ya se unieron"} con tu link.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className={`min-w-0 flex-1 truncate rounded-xl border px-3 py-2.5 font-mono text-xs ${
                tone === "dark"
                  ? "border-white/10 bg-navy text-bone/80"
                  : "border-line bg-bone-2 text-ink/80"
              }`}
            />
            <button
              type="button"
              onClick={() => handleCopy(link)}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-ember px-3 py-2.5 text-xs font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <CopyIcon className="h-3.5 w-3.5" />
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
              tone === "dark"
                ? "bg-white/5 text-bone hover:bg-white/10"
                : "bg-bone-2 text-navy hover:bg-line/60"
            }`}
          >
            <WhatsAppIcon className="h-4 w-4 text-verde" />
            Compartir por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md" noValidate>
      <div className="flex flex-col gap-3">
        <label htmlFor={nameId} className="sr-only">
          Nombre completo
        </label>
        <input
          id={nameId}
          type="text"
          required
          minLength={3}
          autoComplete="name"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={fieldClass(tone)}
        />

        <label htmlFor={emailId} className="sr-only">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass(tone)}
        />

        <label htmlFor={whatsappId} className="sr-only">
          WhatsApp (opcional)
        </label>
        <input
          id={whatsappId}
          type="tel"
          autoComplete="tel"
          placeholder="WhatsApp (opcional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className={fieldClass(tone)}
        />

        <label htmlFor={platformId} className="sr-only">
          Plataforma (opcional)
        </label>
        <div className="relative">
          <select
            id={platformId}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className={`${fieldClass(tone)} appearance-none pr-10`}
          >
            <option value="">¿En qué plataforma trabajas? (opcional)</option>
            {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              tone === "dark" ? "text-bone/50" : "text-mute"
            }`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-1 w-full cursor-pointer rounded-xl bg-ember px-6 py-3 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          {status === "submitting" ? "Enviando…" : "Únete a la lista"}
        </button>
      </div>

      <div
        aria-live="polite"
        className={`min-h-[1.25rem] pt-2 text-sm ${tone === "dark" ? "text-ember" : "text-ember"}`}
      >
        {error}
      </div>
    </form>
  );
}
