"use client";

// A landing card that keeps the page light on text: the front shows only an
// icon and a title; tapping it slides up a panel with the details.
//
// Motion: hover shades the card (pointer devices only), press scales it to
// 0.98 for feedback, the panel enters on the drawer curve and leaves faster
// than it enters. Escape or the close button dismisses it.
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Plus, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InfoCard({
  icon,
  title,
  label,
  detail,
  link,
  highlight = false,
  className,
}: {
  /** Rendered icon element (a component can't cross the server/client boundary). */
  icon: React.ReactNode;
  title: string;
  label?: string;
  detail: string;
  link?: { href: string; label: string };
  highlight?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={cn(
        // Front and panel share one grid cell, so the card is as tall as the
        // longer of the two and the panel's text is never clipped.
        "relative isolate grid overflow-hidden rounded-[28px]",
        highlight
          ? "bg-lp-accent text-lp-accent-fg"
          : "border border-lp-line bg-lp-surface",
        className,
      )}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className={cn(
          "group col-start-1 row-start-1 flex h-full min-h-[184px] w-full flex-col justify-between p-6 text-left transition-[background-color,scale] duration-200 ease-snappy active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lp-fg sm:min-h-[240px] sm:p-7",
          highlight ? "hover:bg-black/[0.06]" : "hover:bg-lp-surface-2/70",
        )}
      >
        <span className="flex items-start justify-between">
          {icon}
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-[transform,background-color,color,border-color] duration-200 ease-snappy group-hover:rotate-90",
              highlight
                ? "border-current/25"
                : "border-lp-line group-hover:border-transparent group-hover:bg-lp-fg group-hover:text-lp-bg",
            )}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
          </span>
        </span>
        <span>
          {label && (
            <span className="mb-1 block font-mono text-xs opacity-60">{label}</span>
          )}
          <span className="block text-[1.75rem] font-medium leading-tight tracking-[-0.03em] sm:text-3xl">
            {title}
          </span>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "z-10 col-start-1 row-start-1 flex flex-col justify-between gap-6 bg-lp-band p-6 text-lp-band-fg transition-[translate,opacity] sm:p-7",
          open
            ? "translate-y-0 opacity-100 duration-[380ms] ease-drawer"
            : "translate-y-full opacity-0 duration-200 ease-snappy",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg font-medium tracking-[-0.01em]">{title}</p>
          <button
            ref={close}
            type="button"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus({ preventScroll: true });
            }}
            aria-label="Cerrar detalles"
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lp-band-line transition-[transform,background-color] duration-[160ms] ease-snappy hover:bg-white/10 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-band-fg"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div>
          <p className="text-[15px] leading-relaxed text-lp-band-muted">{detail}</p>
          {link && (
            <Link
              href={link.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lp-pill underline-offset-4 transition-transform duration-[160ms] ease-snappy hover:underline active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-band-fg"
            >
              {link.label}
              <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
