import Link from "next/link";
import { CarFront, KeyRound, Store } from "lucide-react";
import { AuthShell, SignInPage } from "@/components/ui/sign-in";
import { AuthForm } from "./Forms";
import "@/app/auth.css";

// Sign-in screens offer a third way in: a business PIN for on-site staff
// (no account). Registration only has the two account types.
export function AudienceSwitch({
  mode,
  active,
}: {
  mode: "login" | "register";
  active: "driver" | "business" | "pin";
}) {
  const login = mode === "login";
  return (
    <nav className="rp-access-switch animate-element animate-delay-100" aria-label="Tipo de acceso">
      <Link
        href={login ? "/login" : "/register"}
        aria-current={active === "driver" ? "page" : undefined}
      >
        <CarFront size={18} />
        Conductor
      </Link>
      <Link
        href={login ? "/business/login" : "/business/register"}
        aria-current={active === "business" ? "page" : undefined}
      >
        <Store size={18} />
        Comercio
      </Link>
      {login && (
        <Link href="/pin" aria-current={active === "pin" ? "page" : undefined}>
          <KeyRound size={18} />
          PIN
        </Link>
      )}
    </nav>
  );
}

export default function AuthPage({
  mode,
  next,
  error,
  deleted,
  audience = "driver",
}: {
  mode: "login" | "register" | "recover";
  next?: string;
  error?: boolean;
  deleted?: boolean;
  audience?: "driver" | "business";
}) {
  const business = audience === "business";
  const heroTagline = business
    ? "Más visitas. Un beneficio a la vez."
    : "Tu club de beneficios en Panamá.";
  const loginPath = business ? "/business/login" : "/login";

  if (mode === "login") {
    return (
      <SignInPage
        title={business ? "Tu comercio, conectado." : "Qué bueno verte de vuelta."}
        heroTagline={heroTagline}
        audience={audience}
        next={next || (business ? "/business" : "/driver/dashboard")}
        notice={
          deleted
            ? "Tu cuenta fue eliminada. Gracias por haber sido parte de RidePerks."
            : error
              ? "El enlace venció o ya fue utilizado. Inicia sesión o solicita uno nuevo."
              : undefined
        }
        audienceSwitch={
          <AudienceSwitch mode="login" active={business ? "business" : "driver"} />
        }
        createAccountHref={business ? "/business/register" : "/register"}
        createAccountLabel={business ? "Registrar responsable →" : "Crear cuenta gratis →"}
        createAccountQuestion={
          business ? "¿Tu comercio aún no tiene cuenta?" : "¿Primera vez por aquí?"
        }
      />
    );
  }

  const title =
    mode === "register"
      ? business
        ? "Suma tu comercio a RidePerks."
        : "Tu próximo ahorro empieza aquí."
      : "Recupera tu acceso.";
  const description =
    mode === "register"
      ? business
        ? "Crea la cuenta del responsable. El equipo de RidePerks la vinculará a tu comercio."
        : "Crea tu cuenta gratis y entra directamente. Si estabas en la lista de espera, usa el mismo correo."
      : "Te enviaremos un enlace para elegir una nueva contraseña.";

  return (
    <AuthShell heroTagline={heroTagline}>
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="animate-element text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Volver a RidePerks
        </Link>
        {mode === "register" && (
          <AudienceSwitch mode="register" active={business ? "business" : "driver"} />
        )}
        <h1 className="animate-element animate-delay-200 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="animate-element animate-delay-300 text-muted-foreground">
          {description}
        </p>
        <div className="animate-element animate-delay-400">
          <AuthForm
            mode={mode}
            next={next || (business ? "/business" : "/driver/dashboard")}
            audience={audience}
          />
        </div>
        <p className="animate-element animate-delay-500 text-center text-sm text-muted-foreground">
          {mode === "register" ? (
            <Link href={loginPath} className="text-ember transition-colors hover:underline">
              Ya tengo una cuenta. Iniciar sesión →
            </Link>
          ) : (
            <Link href={loginPath} className="text-ember transition-colors hover:underline">
              Volver a iniciar sesión →
            </Link>
          )}
        </p>
      </div>
    </AuthShell>
  );
}
