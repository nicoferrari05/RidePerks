"use client";

import { useEffect, useRef } from "react";

// Silk Blend (21st.dev), recoloured to soft blue and celeste: white, then
// celeste, soft blue and a deeper blue along a line at 191deg that sways
// gently around it (calmer and slower than the original spec, as asked).
//
// Built to cost almost nothing per frame: the colours are painted once into
// a 2 x 128 canvas, stretched over a square that covers the panel at any
// angle, and the sway is a CSS rotate animation. The browser runs that on
// the compositor (GPU) with no JavaScript, style or paint work per frame,
// and the tiny canvas texture is uploaded once. The stretch also softens
// the stops, like the original's blur. The animation pauses off screen.
//
// Timing: rotate from 6deg to 16deg (11deg is the 191deg base, so +-5deg),
// with an ease-in-out-sine curve, alternating every 9s (an 18s cycle),
// started half way through so the sway is exactly 0 and rising at t = 0.

const BASE = 191;
const STOPS: [number, string][] = [
  [0.54, "#ffffff"],
  [0.57, "#a8d2ee"],
  [0.6, "#3d8fe0"],
  [1, "#0066cc"],
];
const TEXELS = 128;

export default function SilkGradient({ lift = 0 }: { lift?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!box || !canvas || !ctx) return;
    canvas.width = 2;
    canvas.height = TEXELS;

    let last = "";
    const paint = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      const key = w + "x" + h;
      if (!w || !h || key === last) return;
      last = key;
      // A square whose side is the panel's diagonal covers it at any angle.
      const side = Math.ceil(Math.hypot(w, h)) + 4;
      canvas.style.width = side + "px";
      canvas.style.height = side + "px";
      canvas.style.left = (w - side) / 2 + "px";
      canvas.style.top = (h - side) / 2 + "px";
      // Same stop spacing as a CSS linear-gradient at the base angle: its
      // line runs |w sin a| + |h cos a| across the panel.
      const a = (BASE * Math.PI) / 180;
      const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
      const g = ctx.createLinearGradient(0, 0, 0, TEXELS);
      g.addColorStop(0, "#ffffff");
      for (const [pos, color] of STOPS) {
        const p = pos === 1 ? pos : pos + lift;
        g.addColorStop(Math.min(1, Math.max(0, 0.5 + ((p - 0.5) * len) / side)), color);
      }
      g.addColorStop(1, "#0066cc");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2, TEXELS);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(box);
    // Pause the compositor animation while the panel is off screen.
    const io = new IntersectionObserver(([e]) => {
      box.classList.toggle("is-off", !e?.isIntersecting);
    });
    io.observe(box);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [lift]);

  return (
    <div ref={wrap} aria-hidden="true" className="rpx-silk">
      <canvas ref={ref} className="rpx-silk-layer" />
    </div>
  );
}
