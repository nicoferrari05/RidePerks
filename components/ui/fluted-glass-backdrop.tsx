"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The fluted-glass texture from the footer component the user supplied
// (footer-section-5, Paper Design's FlutedGlass shader), as a backdrop for
// any colored panel: the panel keeps its own background color and the
// shader only adds the vertical prism highlights and shadows on top.
//
// Static (no animation), so after its first frame it costs nothing. The
// WebGL code loads only when the panel gets near the screen, and the pixel
// count is capped so big panels on large screens stay cheap.
const FlutedGlass = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.FlutedGlass),
  { ssr: false },
);

const TONES = {
  // On the yellow-green panels.
  light: { highlights: 0.1, shadows: 0.2, grain: 0.1 },
  // On the pitch-black bands: brighter edges so the flutes still read.
  dark: { highlights: 0.12, shadows: 0.3, grain: 0.05 },
};

export default function FlutedGlassBackdrop({
  tone = "light",
  size = 0.89,
}: {
  tone?: keyof typeof TONES;
  /** Flute width: smaller is denser. */
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const t = TONES[tone];
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {near && (
        <FlutedGlass
          size={size}
          shape="lines"
          angle={0}
          distortionShape="prism"
          distortion={0.5}
          shift={0}
          blur={0}
          edges={0.25}
          stretch={0}
          scale={1.11}
          fit="cover"
          highlights={t.highlights}
          shadows={t.shadows}
          grainMixer={t.grain}
          grainOverlay={t.grain}
          colorBack="#00000000"
          colorHighlight="#FFFFFF"
          colorShadow="#000000"
          speed={0}
          maxPixelCount={1600 * 900}
          className="lp-fluted-in h-full w-full bg-transparent"
        />
      )}
    </div>
  );
}
