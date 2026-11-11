"use client";

// Landing pricing, adapted from the pricing-section-3 pattern: a monthly /
// annual switch, an animated price and two plans. Real numbers only (see
// lib/payments/yappy-protocol PLANS and the rp_payment_orders check): free
// account, $15.00 a month, or $150.00 once for 12 months.
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Check } from "lucide-react";
import { LayoutGroup, motion, useInView, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {
  VerticalCutReveal,
  type VerticalCutRevealRef,
} from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";

type Period = "monthly" | "annual";

const FREE = {
  name: "Gratis",
  description: "Para conocer el club antes de pagar.",
  includesTitle: "Incluye:",
  includes: [
    "Crear tu cuenta y verificar tu perfil",
    "Ver los beneficios y comercios aliados",
    "Guardar favoritos y recibir avisos",
  ],
};

const MEMBER = {
  name: "Membresía",
  description: "Para usar los descuentos cada vez que trabajas.",
  includesTitle: "Todo lo gratis, y además:",
  includes: [
    "Usar todos los beneficios con tu código QR",
    "Tu ahorro del mes y el total, al día",
    "Recibo de cada pago",
    "Sin cargos automáticos: tú decides cuándo renovar",
  ],
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  }),
};

function PeriodSwitch({
  value,
  onChange,
}: {
  value: Period;
  onChange: (value: Period) => void;
}) {
  const options: { id: Period; label: string }[] = [
    { id: "monthly", label: "Mensual" },
    { id: "annual", label: "Anual" },
  ];
  return (
    <LayoutGroup id="pricing-period">
      <div
        role="radiogroup"
        aria-label="Forma de pago"
        className="relative flex w-fit rounded-full border border-lp-line bg-lp-surface p-1"
      >
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-[color,transform] duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg sm:h-12 sm:px-6",
                selected ? "text-lp-band-fg" : "text-lp-muted hover:text-lp-fg",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="period-pill"
                  className="absolute inset-0 rounded-full bg-lp-band shadow-[0_6px_16px_-8px_rgba(16,11,0,0.6)]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{option.label}</span>
              {option.id === "annual" && (
                <span className="relative rounded-full bg-lp-accent px-2 py-0.5 text-xs font-semibold text-lp-accent-fg">
                  2 meses gratis
                </span>
              )}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function Includes({
  title,
  items,
  dark = false,
}: {
  title: string;
  items: string[];
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-6 border-t pt-6",
        dark ? "border-lp-band-line" : "border-lp-line",
      )}
    >
      <h4 className="mb-4 text-[15px] font-semibold">{title}</h4>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px]">
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-content-center rounded-full",
                dark
                  ? "bg-lp-accent text-lp-accent-fg"
                  : "border border-lp-fg text-lp-fg",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className={dark ? "text-lp-band-fg/85" : "text-lp-muted"}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const buttonBase =
  "flex h-14 w-full items-center justify-center rounded-full px-6 text-base font-semibold transition-[transform,opacity] duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function PricingSection() {
  const [period, setPeriod] = useState<Period>("monthly");
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<VerticalCutRevealRef>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  useEffect(() => {
    if (inView) titleRef.current?.startAnimation();
  }, [inView]);
  const annual = period === "annual";

  return (
    <div ref={sectionRef} className="mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.035em]">
            <VerticalCutReveal
              ref={titleRef}
              autoStart={false}
              splitBy="words"
              staggerDuration={0.08}
              containerClassName="justify-start"
              transition={{ type: "spring", stiffness: 250, damping: 40 }}
            >
              Planes y precios
            </VerticalCutReveal>
          </h2>
          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={sectionRef}
            customVariants={reveal}
            className="mt-3 max-w-md text-pretty text-lg text-lp-muted"
          >
            Crear tu cuenta es gratis. Pagas solo cuando quieras usar los
            beneficios, con Yappy.
          </TimelineContent>
        </div>
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={sectionRef}
          customVariants={reveal}
        >
          <PeriodSwitch value={period} onChange={setPeriod} />
        </TimelineContent>
      </div>

      <TimelineContent
        as="div"
        animationNum={2}
        timelineRef={sectionRef}
        customVariants={reveal}
        className="mt-10 grid gap-3 rounded-[32px] bg-gradient-to-b from-lp-surface to-lp-surface-2 p-2 sm:mt-14 sm:p-3 md:grid-cols-2"
      >
        {/* Free */}
        <TimelineContent
          as="div"
          animationNum={3}
          timelineRef={sectionRef}
          customVariants={reveal}
        >
          <Card className="flex h-full flex-col justify-between rounded-[26px] border-none bg-transparent text-lp-fg shadow-none">
            <CardContent className="p-6 sm:p-8">
              <p className="flex items-baseline gap-1.5">
                <span className="text-[3.25rem] font-semibold leading-none tracking-[-0.04em]">
                  $0
                </span>
                <span className="text-lp-muted">para siempre</span>
              </p>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">
                {FREE.name}
              </h3>
              <p className="mt-1 text-lp-muted">{FREE.description}</p>
              <Includes title={FREE.includesTitle} items={FREE.includes} />
            </CardContent>
            <CardFooter className="p-6 pt-0 sm:p-8 sm:pt-0">
              <Link
                href="/register"
                className={cn(
                  buttonBase,
                  "bg-lp-fg text-lp-bg hover:opacity-90 focus-visible:outline-lp-fg",
                )}
              >
                Crear cuenta gratis
              </Link>
            </CardFooter>
          </Card>
        </TimelineContent>

        {/* Paid */}
        <TimelineContent
          as="div"
          animationNum={4}
          timelineRef={sectionRef}
          customVariants={reveal}
        >
          <Card className="relative flex h-full flex-col justify-between rounded-[26px] border-none bg-gradient-to-b from-[#1d180b] to-lp-band text-lp-band-fg shadow-[0_30px_60px_-30px_rgba(16,11,0,0.7)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[3.25rem] font-semibold leading-none tracking-[-0.04em]">
                    $
                    <NumberFlow
                      value={annual ? 150 : 15}
                      className="tabular-nums"
                    />
                  </span>
                  <span className="text-lp-band-muted">
                    {annual ? "al año" : "al mes"}
                  </span>
                </p>
                <span className="rounded-full bg-lp-accent px-3 py-1 text-xs font-semibold text-lp-accent-fg">
                  Todo incluido
                </span>
              </div>
              <p className="mt-3 min-h-[1.5rem] text-sm text-lp-band-muted">
                {annual
                  ? "Un solo pago por 12 meses. Equivale a $12.50 al mes: ahorras $30."
                  : "Pagas mes a mes con Yappy. Sin cargos automáticos."}
              </p>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
                {MEMBER.name}
              </h3>
              <p className="mt-1 text-lp-band-muted">{MEMBER.description}</p>
              <Includes
                title={MEMBER.includesTitle}
                items={MEMBER.includes}
                dark
              />
            </CardContent>
            <CardFooter className="flex-col gap-3 p-6 pt-0 sm:p-8 sm:pt-0">
              <Link
                href="/register"
                className={cn(
                  buttonBase,
                  "bg-lp-accent text-lp-accent-fg hover:opacity-90 focus-visible:outline-lp-band-fg",
                )}
              >
                {annual ? "Empezar con el plan anual" : "Empezar con el plan mensual"}
              </Link>
              <Link
                href={"/driver/membership?plan=" + period}
                className="rounded-full px-4 py-2 text-sm text-lp-band-muted underline-offset-4 transition-colors hover:text-lp-band-fg hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-band-fg"
              >
                ¿Ya tienes cuenta? Activa tu plan
              </Link>
            </CardFooter>
          </Card>
        </TimelineContent>
      </TimelineContent>

      <p className="mt-5 text-sm text-lp-muted">
        Para pagar necesitas tu perfil verificado. El plan anual no se cobra en
        cuotas ni se renueva solo.
      </p>
    </div>
  );
}
