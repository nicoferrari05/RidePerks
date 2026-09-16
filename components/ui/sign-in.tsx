"use client";
import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/platform/auth-actions";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
  );
}

function GlassInputWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-ember/60 focus-within:bg-ember/5">
      {children}
    </div>
  );
}

// Shared two-column shell: form content on the left, a full-bleed hero
// image on the right (hidden below md). Used by SignInPage below and by
// AuthPage.tsx for register/recover, so all three auth screens share one
// layout instead of each reimplementing it.
export function AuthShell({
  heroImageSrc,
  heroTagline,
  children,
}: {
  heroImageSrc?: string;
  heroTagline?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] w-full font-sans">
      <section className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
      {heroImageSrc && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 overflow-hidden rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            {heroTagline && (
              <div className="absolute inset-x-0 bottom-0 p-10">
                <p className="max-w-sm text-2xl font-semibold leading-snug text-bone">
                  {heroTagline}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export function SignInPage({
  title,
  description,
  heroImageSrc,
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
  description: ReactNode;
  heroImageSrc?: string;
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
    <AuthShell heroImageSrc={heroImageSrc} heroTagline={heroTagline}>
      <div className="flex flex-col gap-6">
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
        <p className="animate-element animate-delay-300 text-muted-foreground">
          {description}
        </p>
        {notice && (
          <p role="alert" className="animate-element rounded-2xl bg-ember-soft px-4 py-3 text-sm text-ember-2">
            {notice}
          </p>
        )}

        <form action={formAction} className="space-y-5">
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
                className="w-full rounded-2xl bg-transparent p-4 text-base focus:outline-none"
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
                  className="w-full rounded-2xl bg-transparent p-4 pr-12 text-base focus:outline-none"
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
            className="animate-element animate-delay-700 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Un momento…" : "Iniciar sesión"}
          </button>
        </form>

        <div className="animate-element animate-delay-800 relative flex items-center justify-center">
          <span className="w-full border-t border-border" />
          <span className="absolute bg-background px-4 text-sm text-muted-foreground">
            O continúa con
          </span>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente"
          className="animate-element animate-delay-900 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-border py-4 text-foreground/40"
        >
          <GoogleIcon />
          Continuar con Google
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Próximamente
          </span>
        </button>

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
