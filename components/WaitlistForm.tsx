"use client";

import { FormEvent, useId, useState } from "react";
import { CheckIcon } from "./icons";

type Platform = "uber" | "indrive";
type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-[15px] text-ink placeholder:text-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember md:px-0 md:py-2.5 md:min-w-[130px]";

export default function WaitlistForm() {
  const nameId = useId();
  const whatsappId = useId();
  const [fullName, setFullName] = useState("");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    if (!platform) {
      setError("Selecciona tu plataforma: Uber o InDrive.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, platform, whatsapp }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data?.error ?? "Algo salió mal. Intenta de nuevo.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("No pudimos conectar. Revisa tu internet e intenta de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex w-full max-w-3xl items-center gap-3 rounded-3xl border border-line bg-white px-6 py-5 text-navy shadow-[0_20px_60px_-30px_rgba(15,27,61,0.35)] transition-all duration-300 ease-out"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-verde text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">Listo, ya estás en la lista.</p>
          <p className="text-sm text-mute">Te escribimos por WhatsApp apenas abramos.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl" noValidate>
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white/90 p-3 shadow-[0_30px_80px_-40px_rgba(15,27,61,0.35)] backdrop-blur md:flex-row md:items-center md:rounded-full md:p-2 md:pl-6">
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
          className={inputClass}
        />

        <div className="hidden h-6 w-px shrink-0 bg-line md:block" />

        <div
          role="radiogroup"
          aria-label="Plataforma"
          className="flex shrink-0 gap-1 rounded-full bg-bone-2 p-1 text-sm"
        >
          {(["uber", "indrive"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={platform === p}
              onClick={() => setPlatform(p)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                platform === p ? "bg-navy text-bone" : "text-mute hover:text-navy"
              }`}
            >
              {p === "indrive" ? "InDrive" : "Uber"}
            </button>
          ))}
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-line md:block" />

        <label htmlFor={whatsappId} className="sr-only">
          Número de WhatsApp
        </label>
        <input
          id={whatsappId}
          type="tel"
          required
          autoComplete="tel"
          placeholder="+507 6123-4567"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full shrink-0 cursor-pointer rounded-full bg-ember px-6 py-3 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {status === "submitting" ? "Enviando…" : "Unirme a la lista"}
        </button>
      </div>

      <div aria-live="polite" className="min-h-[1.25rem] px-4 pt-2 text-sm text-ember">
        {error}
      </div>
    </form>
  );
}
