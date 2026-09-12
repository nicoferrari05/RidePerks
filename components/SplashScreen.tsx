"use client";

// Brief, once-per-session intro on the homepage: the same dot-matrix
// reveal effect used on /admin/login, with the wordmark centered. Lazy
// loaded (react-three-fiber + three is not otherwise part of the public
// bundle) so a returning visitor who skips it — sessionStorage already
// has the flag — never pays for that chunk at all.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import LogoMark from "@/components/LogoMark";

const CanvasRevealEffect = dynamic(
  () =>
    import("@/components/ui/canvas-reveal-effect").then(
      (m) => m.CanvasRevealEffect,
    ),
  { ssr: false },
);

const SEEN_KEY = "rp_splash_seen";
const DISPLAY_MS = 2200;
const FADE_MS = 600;

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  // Caches the show/skip decision so React Strict Mode's dev-only
  // mount→cleanup→mount replay doesn't re-read sessionStorage after the
  // first pass already wrote SEEN_KEY to it — without this, the replay
  // would see its own write and immediately decide to skip.
  const decision = useRef<"show" | "skip" | null>(null);

  // sessionStorage/matchMedia don't exist during SSR, so the real check can
  // only happen client-side, post-hydration — hence setState here rather
  // than a lazy useState initializer (which would mismatch the server's
  // render and trigger a hydration error). useLayoutEffect (not useEffect)
  // so a repeat visit within the same session never flashes the splash
  // before hiding it.
  useLayoutEffect(() => {
    if (decision.current === null) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      decision.current =
        reduceMotion || sessionStorage.getItem(SEEN_KEY) ? "skip" : "show";
      if (decision.current === "show") sessionStorage.setItem(SEEN_KEY, "1");
    }
    if (decision.current === "skip") {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setFading(true), DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setShow(false), FADE_MS);
    return () => clearTimeout(t);
  }, [fading]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-navy transition-opacity duration-[600ms] ease-out ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <CanvasRevealEffect
          animationSpeed={2.2}
          dotSize={5}
          colors={[
            [245, 241, 234],
            [207, 59, 24],
          ]}
          opacities={[0.15, 0.15, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6]}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,var(--color-navy)_72%)]" />
      </div>
      <LogoMark animate size="lg" className="relative sm:text-3xl" />
    </div>
  );
}
