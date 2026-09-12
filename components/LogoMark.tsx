"use client";

// Animated "RIDEPERKS" wordmark pill: glass background bloom-in, then letters
// stagger up. Ported from nicoferrari05/rideperks-platform
// (src/components/shared/Logo.tsx) — same brand pill shown on that repo's
// landing hero — adapted to this project's brand tokens (--color-bone
// instead of --bone) and named LogoMark to avoid colliding with the
// existing plain-text Logo in components/platform/ui.tsx.
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

interface LogoMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "px-3 py-1.5 text-base",
  md: "px-4 py-2 text-xl",
  lg: "px-6 py-3 text-2xl",
  xl: "px-8 py-4 text-4xl",
};

const LETTERS = "RIDEPERKS".split("");

export default function LogoMark({ size = "md", className }: LogoMarkProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const letters = lettersRef.current.filter(Boolean);
      const mm = gsap.matchMedia();

      // Reduced-motion users get the logo rendered statically — no sets, no timeline.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(pillRef.current, { autoAlpha: 0, scale: 0.86 });
        gsap.set(letters, { autoAlpha: 0, y: 6 });

        gsap
          .timeline()
          // Pill blooms in
          .to(pillRef.current, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "expo.out",
          })
          // Letters stagger up, overlapping with the tail of the bloom
          .to(
            letters,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              ease: "expo.out",
              stagger: 0.04,
            },
            0.12,
          );
      });

      return () => mm.revert();
    },
    { scope: pillRef },
  );

  return (
    <div
      ref={pillRef}
      className={cn(
        "inline-flex items-center rounded-full font-extrabold tracking-tight select-none",
        sizes[size],
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(245,241,234,0.11) 0%, rgba(245,241,234,0.05) 100%)",
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        border: "1px solid rgba(245,241,234,0.14)",
        boxShadow:
          "inset 0 1.5px 0 rgba(245,241,234,0.13), inset 0 -1px 0 rgba(245,241,234,0.04), 0 4px 20px rgba(0,0,0,0.28)",
        color: "var(--color-bone)",
      }}
    >
      {LETTERS.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            lettersRef.current[i] = el;
          }}
          style={{ display: "inline-block" }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
