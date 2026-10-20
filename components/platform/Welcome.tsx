"use client";
import { useState } from "react";
import { BadgeCheck, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finishOnboarding } from "@/lib/platform/app-actions";

// First run for a new driver: three short screens, then their first step.
const steps = [
  {
    icon: BadgeCheck,
    title: "Verifica que eres conductor",
    text: "Sube una captura de tu perfil en Uber, inDrive o PedidosYa. El equipo la revisa a mano.",
  },
  {
    icon: CreditCard,
    title: "Activa tu membresía",
    text: "$15 al mes con Yappy. Sin cargos automáticos: tú decides cuándo renovar.",
  },
  {
    icon: QrCode,
    title: "Ahorra en cada parada",
    text: "En el comercio, abre el beneficio y muestra tu código. Tu ahorro queda registrado.",
  },
];

export default function Welcome({ name }: { name: string }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const Icon = step.icon;
  const last = index === steps.length - 1;
  return (
    <div className="rp-welcome">
      <form action={finishOnboarding} className="rp-welcome-skip">
        <input type="hidden" name="next" value="/driver/dashboard" />
        <Button type="submit" variant="ghost" size="md">
          Saltar
        </Button>
      </form>
      <p className="rp-welcome-hello">Hola, {name || "conductor"}</p>
      <section key={index} className="rp-welcome-step" aria-live="polite">
        <span className="rp-welcome-icon">
          <Icon aria-hidden="true" />
        </span>
        <p className="rp-welcome-count">
          Paso {index + 1} de {steps.length}
        </p>
        <h1>{step.title}</h1>
        <p className="rp-muted">{step.text}</p>
      </section>
      <div className="rp-welcome-dots" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.title} className={i === index ? "on" : undefined} />
        ))}
      </div>
      {last ? (
        <form action={finishOnboarding}>
          <input type="hidden" name="next" value="/driver/verify" />
          <Button type="submit" size="lg" className="w-full">
            Empezar: verificar mi cuenta
          </Button>
        </form>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setIndex(index + 1)}>
          Siguiente
        </Button>
      )}
    </div>
  );
}
