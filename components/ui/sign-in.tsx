"use client";
import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/platform/auth-actions";

// Dynamically imported (ssr:false), same as the homepage splash and the
// admin login background — react-three-fiber/three isn't otherwise part
// of this bundle, and WebGL has no server-side renderer to hydrate against.
const CanvasRevealEffect = dynamic(
  () => import("@/components/ui/canvas-reveal-effect").then((m) => m.CanvasRevealEffect),
  { ssr: false },
);

function GlassInputWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-ember/60 focus-within:bg-ember/5">
      {children}
    </div>
  );
}

// Shared two-column shell: form content on the left, the brand's dot-matrix
// reveal animation on the right (hidden below md) — the same visual used on
// the homepage splash and the admin login background, just contained to this
// panel and held on its resolved state instead of fading away after a couple
// of seconds. Used by SignInPage below and by AuthPage.tsx for
// register/recover, so all three auth screens share one layout.
export function AuthShell({
  showHero = true,
  heroTagline,
  children,
}: {
  showHero?: boolean;
  heroTagline?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rp-auth flex h-[100dvh] w-full overflow-hidden overscroll-none font-sans">
      <section className="flex-1 overflow-y-auto overscroll-none">
        {/* min-h-full (a floor, not a cap) on this inner wrapper — not
            overflow-y-auto + items-center directly on the scroll
            container above — keeps a too-tall child (the register form
            on a short screen) reachable by scroll instead of getting
            centered into negative, unreachable offscroll space. */}
        <div className="flex min-h-full items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
      {showHero && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 overflow-hidden rounded-3xl bg-bone">
            {/* Starts on the panel's own light background, then the navy
                dot-matrix layer fades in on top — a white-to-blue crossfade
                rather than the navy just appearing instantly. */}
            <div className="rp-hero-fade-in absolute inset-0 bg-navy">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <CanvasRevealEffect
                  animationSpeed={2.2}
                  dotSize={5}
                  colors={[
                    [239, 255, 200],
                    [133, 203, 51],
                  ]}
                  opacities={[0.15, 0.15, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6]}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,var(--color-navy)_72%)]" />
              </div>
              {heroTagline && (
                <div className="rp-hero-fade-in-delayed absolute inset-x-0 bottom-0 p-10 text-center">
                  <p className="mx-auto max-w-sm text-2xl font-semibold leading-snug text-bone">
                    {heroTagline}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export function SignInPage({
  title,
  description,
  heroTagline,
  audience = "driver",
  next = "/driver/dashboard",
  notice,
  audienceSwitch,
  resetPasswordHref = "/recover",
  createAccountHref = "/register",
  createAccountLabel = "Crear cuenta gratis →",
  createAccountQuestion = "¿Primera vez por aquí?",
}: {
  title: ReactNode;
  description?: ReactNode;
  heroTagline?: ReactNode;
  audience?: "driver" | "business";
  next?: string;
  notice?: ReactNode;
  audienceSwitch?: ReactNode;
  resetPasswordHref?: string;
  createAccountHref?: string;
  createAccountLabel?: string;
  createAccountQuestion?: string;
}) {
  const [state, formAction, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell heroTagline={heroTagline}>
      <div className="flex flex-col gap-5">
        <Link
          href="/"
          className="animate-element text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Volver a RidePerks
        </Link>
        {audienceSwitch}
        <h1 className="animate-element animate-delay-200 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="animate-element animate-delay-300 text-muted-foreground">
            {description}
          </p>
        )}
        {notice && (
          <p role="alert" className="animate-element rounded-2xl bg-ember-soft px-4 py-3 text-sm text-ember-2">
            {notice}
          </p>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="audience" value={audience} />

          <div className="animate-element animate-delay-400">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Correo electrónico
            </label>
            <GlassInputWrapper>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                maxLength={254}
                className="w-full rounded-2xl bg-transparent p-3.5 text-base focus:outline-none"
              />
            </GlassInputWrapper>
          </div>

          <div className="animate-element animate-delay-500">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Contraseña
            </label>
            <GlassInputWrapper>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                  className="w-full rounded-2xl bg-transparent p-3.5 pr-12 text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                  )}
                </button>
              </div>
            </GlassInputWrapper>
          </div>

          <div className="animate-element animate-delay-600 flex items-center justify-end text-sm">
            <Link href={resetPasswordHref} className="text-ember transition-colors hover:underline">
              Olvidé mi contraseña
            </Link>
          </div>

          {state.error && (
            <p role="alert" className="rounded-2xl bg-ember-soft px-4 py-3 text-sm text-ember-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Un momento…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
          {createAccountQuestion}{" "}
          <Link href={createAccountHref} className="text-ember transition-colors hover:underline">
            {createAccountLabel}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
