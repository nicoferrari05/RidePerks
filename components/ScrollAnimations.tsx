"use client";

// Global, restrained scroll-reveal: fades + lifts elements marked with
// data-reveal as they enter the viewport, once, with a short stagger.
// Kept deliberately subtle — this is a marketing page a driver skims on
// a phone, not a showcase for motion. Respects prefers-reduced-motion.
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ScrollAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (items.length === 0) return;

      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          }),
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-reveal]", { opacity: 1, y: 0 });
    });

    return () => mm.revert();
  }, []);

  return null;
}
