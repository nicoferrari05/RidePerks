"use client";

import { useEffect } from "react";

// Fades [data-rv] elements up as they enter the viewport. One observer for
// the whole page; each element is unobserved once shown.
export default function Reveal() {
  useEffect(() => {
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
