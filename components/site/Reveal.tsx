"use client";

import { useEffect } from "react";

// Once per page load (not on client navigation between site pages).
let started = false;

// Opening rideperks.app always starts at the top: the browser's scroll
// restoration is turned off, and a reload or back/forward visit also drops a
// leftover section anchor (/#planes after using the menu). A fresh link to a
// section (someone shares /#planes) still lands on that section.
function startAtTop() {
  if (started) return;
  started = true;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const revisit = nav?.type === "reload" || nav?.type === "back_forward";
  if (location.hash && !revisit) return;
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

// Fades [data-rv] elements up as they enter the viewport. One observer for
// the whole page; each element is unobserved once shown.
export default function Reveal() {
  useEffect(() => {
    startAtTop();
    const root = document.querySelector(".rpx");
    if (!root) return;
    root.classList.add("rpx-js");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    root.querySelectorAll("[data-rv]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
