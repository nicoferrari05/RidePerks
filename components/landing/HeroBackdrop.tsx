"use client";
import GradientWaves from "@/components/GradientWaves";
import { useLandingTheme } from "./theme";

// Same near-static wave field as before, recolored per theme: bone horizon
// by day, pitch black at night, dark khaki for "atardecer".
const PALETTE = {
  light: { horizon: "#CCE39A", wave: "#3B341F", crest: "#85CB33" },
  dark: { horizon: "#3B341F", wave: "#100B00", crest: "#85CB33" },
  dim: { horizon: "#5A5236", wave: "#100B00", crest: "#85CB33" },
} as const;

export default function HeroBackdrop() {
  const colors = PALETTE[useLandingTheme()];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <GradientWaves
        horizonColor={colors.horizon}
        waveColor={colors.wave}
        crestColor={colors.crest}
        speed={0.05}
        amplitude={2.0}
        waveScale={0.5}
        waveRatio={0.85}
        swell={24}
        turbulence={12}
        tilt={1.18}
        zoom={1.05}
        height={5.6}
        fogDepth={12}
        detail="medium"
        brightness={1.0}
        opacity={0.9}
        mouseInteraction={false}
        grain={false}
      />
      {/* Keeps the headline area calm and fades the waves into the page. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_36%,var(--lp-bg)_0%,transparent_75%)] opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--lp-bg))]" />
    </div>
  );
}
