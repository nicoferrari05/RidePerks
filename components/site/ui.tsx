import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SilkGradient from "./SilkGradient";

// Shared building blocks of the public site (landing and About).

export const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
export const SECTION = "scroll-mt-24 py-24 sm:py-36";
export const H2 = "text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]";

export function d(ms: number) {
  return { "--d": ms + "ms" } as CSSProperties;
}

export function Cta({
  href,
  children,
  tone = "dark",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light" | "white";
  className?: string;
}) {
  const arrow = tone !== "light";
  return (
    <Link
      href={href}
      className={cn(
        "rpx-btn inline-flex h-[52px] items-center justify-between gap-4 rounded-full text-[15px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]",
        arrow ? "pl-6 pr-1.5" : "px-6",
        tone === "dark" && "bg-[var(--ink)] text-white hover:bg-[#1b2440]",
        tone === "white" && "bg-white text-[var(--ink)] shadow-[0_12px_30px_-14px_rgba(11,18,32,0.45)]",
        tone === "light" && "bg-white/80 text-[var(--ink)] ring-1 ring-inset ring-[var(--line)] hover:bg-white",
        className,
      )}
    >
      {children}
      {arrow && (
        <span
          className={cn(
            "rpx-btn-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white",
            tone === "dark" ? "bg-[var(--iris)]" : "bg-[var(--ink)]",
          )}
        >
          <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}

export function Phone({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[15%/7%] bg-[var(--ink)] p-[2.2%] shadow-[0_60px_110px_-50px_rgba(0,70,150,0.8),0_0_0_1px_rgba(11,18,32,0.9)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1170}
        height={2532}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full rounded-[13.4%/6.1%] bg-white"
      />
    </div>
  );
}

export function Chip({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rpx-chip flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mist)] text-[var(--iris)]">
        {icon}
      </span>
      <span className="flex flex-col whitespace-nowrap">
        <span className="text-sm font-semibold leading-tight">{title}</span>
        <span className="text-xs text-[var(--muted)]">{text}</span>
      </span>
    </div>
  );
}

/* ---------- Cierre ---------- */

export function JoinCta() {
  return (
    <section className="px-2 sm:px-3">
      <div className="relative isolate overflow-hidden rounded-[28px] sm:rounded-[40px]">
        <SilkGradient lift={0.02} />
        <div className={cn(CONTAINER, "relative pt-24 text-center sm:pt-32")}>
          <h2
            data-rv
            className="text-balance text-[clamp(2.9rem,8vw,6.25rem)] font-semibold leading-[0.96] tracking-[-0.05em]"
          >
            Crea tu cuenta gratis.
          </h2>
          <div data-rv style={d(100)} className="mt-9 flex flex-wrap justify-center gap-3">
            <Cta href="/register">Crear mi cuenta</Cta>
            <Cta href="/login" tone="light">
              Ya tengo cuenta
            </Cta>
          </div>
          <div
            data-rv
            style={d(200)}
            className="relative mx-auto mt-16 h-[360px] w-[240px] sm:mt-20 sm:h-[440px] sm:w-[300px]"
          >
            <Phone
              src="/brand/screens/app-confirmado.png"
              alt="Pantalla de beneficio confirmado: el comercio lo registró en tu actividad."
              sizes="(min-width: 640px) 300px, 240px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
