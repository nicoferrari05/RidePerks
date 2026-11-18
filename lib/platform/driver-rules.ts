import type { SetupStep } from "@/components/ui/setup-progress";
import type { Profile, Redemption } from "./types";

// Small rules the driver screens apply, shared by the web views and the
// phone app's API so both show the same steps and the same rating window.

/** Setup steps for a driver account, in the order they unlock each other. */
export function driverSetupSteps({
  profile: p,
  hasAccess,
  verificationPending,
  hasUsedBenefit,
}: {
  profile: Profile;
  hasAccess: boolean;
  verificationPending: boolean;
  hasUsedBenefit: boolean;
}): SetupStep[] {
  const verified = p.status === "verified";
  return [
    { label: "Crea tu cuenta", completed: true },
    {
      label: "Completa tu perfil",
      completed: Boolean(p.phone && p.platform),
      href: "/driver/profile/edit",
      action: "Completar perfil",
    },
    {
      label: "Verifica tu perfil de conductor",
      completed: verified,
      note: verified
        ? undefined
        : verificationPending
          ? "En revisión: te avisamos al aprobarla"
          : p.status === "rejected"
            ? "Necesitamos otra captura"
            : "Sube una captura de tu app",
      href: verificationPending ? undefined : "/driver/verify",
      action: "Verificar ahora",
    },
    {
      label: "Activa tu membresía",
      completed: hasAccess,
      note: hasAccess ? undefined : "$15 al mes o $150 al año, con Yappy",
      href: verified ? "/driver/membership" : undefined,
      action: "Elegir plan",
    },
    {
      label: "Usa tu primer beneficio",
      completed: hasUsedBenefit,
      note: hasUsedBenefit ? undefined : "Muestra tu código en un comercio",
      href: verified && hasAccess ? "/driver/benefits" : undefined,
      action: "Ver beneficios",
    },
  ];
}

/** Uses from the last 30 days can be rated once. */
export function canRate(r: Redemption, now: number) {
  return (
    r.rated === false &&
    now - new Date(r.redeemed_at).getTime() < 30 * 86400000
  );
}
