"use client";
import GradientWaves from "@/components/GradientWaves";

// Near-static wave field in the light palette: mint horizon, khaki waves,
// yellow-green crests.
export default function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <GradientWaves
        horizonColor="#CCE39A"
        waveColor="#3B341F"
        crestColor="#85CB33"
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
