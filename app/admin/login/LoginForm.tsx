"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/ui/sign-in";
import "@/app/platform.css";

type Status = "idle" | "submitting" | "success" | "error";

// Same shell as the driver/business sign-in screens; only the form differs
// (one shared password, checked by /api/admin/login).
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting" || status === "success") return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Contraseña incorrecta.");
        setStatus("error");
        return;
      }
      setStatus("success");
      const candidate = searchParams.get("next") || "/admin/platform";
      const next =
        /^\/admin(?:\/|$)/.test(candidate) && !candidate.includes("\\")
          ? candidate
          : "/admin/platform";
      router.replace(next);
      router.refresh();
    } catch {
      setError("No pudimos conectar. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <AuthShell heroTagline="El panel de RidePerks.">
      <div className="flex flex-col gap-5">
        <Link
          href="/"
          className="animate-element text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Volver a RidePerks
        </Link>
        <h1 className="animate-element animate-delay-200 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Administración.
        </h1>
        <p className="animate-element animate-delay-300 text-muted-foreground">
          Ingresa la contraseña del equipo para gestionar la plataforma.
        </p>
        <form
          onSubmit={handleSubmit}
          className="rp-form animate-element animate-delay-400"
        >
          <div className="rp-field">
            <label htmlFor="password">Contraseña</label>
            <div className="rp-password">
              <input
                id="password"
                type={visible ? "text" : "password"}
                required
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div aria-live="polite">
            {error && (
              <p className="rp-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="rp-button"
            disabled={status === "submitting" || status === "success"}
          >
            {status === "submitting"
              ? "Entrando…"
              : status === "success"
                ? "Abriendo el panel…"
                : "Entrar"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
