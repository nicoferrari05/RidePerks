"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { CheckIcon } from "@/components/icons";

type Status = "idle" | "submitting" | "success" | "error";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reverseReveal, setReverseReveal] = useState(false);
  const cardControls = useAnimation();

  // Entrance for the card. Runs once; the shake below is a separate,
  // independent animation on the same controls object so re-renders
  // while typing never retrigger it.
  useEffect(() => {
    cardControls.start({ opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } });
  }, [cardControls]);

  // Once the "unlocking" canvas has fully played, hand off to the dashboard.
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => {
      const next = searchParams.get("next") || "/admin";
      router.replace(next);
      router.refresh();
    }, 1400);
    return () => clearTimeout(t);
  }, [status, router, searchParams]);

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
        cardControls.start({
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.45, ease: "easeInOut" },
        });
        return;
      }

      setReverseReveal(true);
      setStatus("success");
    } catch {
      setError("No pudimos conectar. Intenta de nuevo.");
      setStatus("error");
      cardControls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
      });
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-navy">
      {/* Background: brand-toned dot-matrix reveal (bone + ember on navy). */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CanvasRevealEffect
          animationSpeed={2.2}
          dotSize={5}
          colors={[
            [245, 241, 234],
            [207, 59, 24],
          ]}
          opacities={[0.15, 0.15, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6]}
          reverse={reverseReveal}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,var(--color-navy)_72%)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="px-6 py-6 sm:px-10 sm:py-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-bone/50 transition-colors duration-150 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
          >
            ← rideperks.app
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <motion.span
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-verde text-white"
                >
                  <CheckIcon className="h-6 w-6" />
                </motion.span>
                <p className="text-lg font-medium text-bone">Adentro. Cargando la lista…</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 16 }}
                animate={cardControls}
                className="w-full max-w-sm rounded-3xl border border-white/10 bg-navy-2/80 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.6)]"
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-bold tracking-tight text-bone">
                  RIDE<span className="text-ember">PERKS</span>
                </div>
                <h1 className="text-xl font-semibold text-bone">Panel de administración</h1>
                <p className="mt-1 text-sm text-bone/50">
                  Ingresa la contraseña para ver la lista de espera.
                </p>

                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="mt-6 w-full rounded-xl border border-white/10 bg-navy px-4 py-3 text-bone placeholder:text-bone/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
                />

                <div aria-live="polite" className="min-h-[1.5rem] pt-3">
                  {error && (
                    <p className="text-sm text-ember" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={status === "submitting"}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15, ease: easeOut }}
                  className="mt-3 w-full cursor-pointer rounded-xl bg-ember px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:bg-ember-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" ? "Entrando…" : "Entrar"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
