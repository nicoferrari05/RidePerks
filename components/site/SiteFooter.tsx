"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/icons";

// The footer sits over a road that runs to the Panama City skyline, printed
// in ordered dither with the brand blues. It is drawn once (and again only
// if the width changes): no animation loop, no pointer tracking.

const COLUMNS = [
  {
    title: "Club",
    links: [
      { label: "Beneficios", href: "/#beneficios" },
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "La app", href: "/#app" },
      { label: "Planes", href: "/#planes" },
      { label: "Nosotros", href: "/about" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { label: "Crear cuenta", href: "/register" },
      { label: "Iniciar sesión", href: "/login" },
      { label: "Comercios", href: "/business/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de uso", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
];

// Paper to deepest tone: white, mist, celeste, soft blues, navy.
const TONES = ["#ffffff", "#edf5fc", "#d6e9f7", "#b4d7f0", "#8dc3e8", "#5fa2e4", "#2a80d8", "#0066cc", "#0b1220"];

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
  22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29,
  53, 21,
].map((v) => (v + 0.5) / 64);

const PIXEL = 2;
const SEED = 507;

function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  // Little-endian ABGR for a Uint32 view of ImageData.
  return ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
}

type Building = { x0: number; w: number; h: number; kind: number };

// A row of towers along the horizon. The envelope puts the tall cluster a
// little left of centre, where the road ends, and a second one to the right.
function skyline(cols: number, maxH: number, layer: number): Building[] {
  const out: Building[] = [];
  let i = 0;
  let x = -3;
  const env = (u: number) =>
    0.18 + 0.82 * Math.exp(-(((u - 0.44) / 0.17) ** 2)) + 0.5 * Math.exp(-(((u - 0.76) / 0.09) ** 2));
  while (x < cols) {
    const r = (k: number) => hash(i, layer * 17 + k, SEED);
    const w = layer === 0 ? 6 + Math.floor(r(1) * 9) : 4 + Math.floor(r(1) * 6);
    const e = Math.min(1, env((x + w / 2) / cols));
    const h = Math.max(3, (layer === 0 ? 0.55 : 0.25 + 0.75 * r(2)) * e * maxH * (0.75 + 0.25 * r(3)));
    out.push({ x0: x, w, h, kind: Math.floor(r(4) * 6) });
    x += w + (r(5) < 0.25 ? 1 + Math.floor(r(6) * 3) : 0);
    i++;
  }
  return out;
}

function paint(canvas: HTMLCanvasElement, cols: number, rows: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = cols;
  canvas.height = rows;
  canvas.style.width = cols * PIXEL + "px";
  canvas.style.height = rows * PIXEL + "px";

  const pal = TONES.map(hex);
  const n = pal.length;
  const tone = new Float32Array(cols * rows);
  const hz = Math.round(rows * 0.5);
  const vx = cols * 0.5;
  const depth = rows - hz;

  // Sky: paper, with a faint haze settling on the horizon.
  for (let y = 0; y < hz; y++) {
    const t = 0.1 * smooth(hz * 0.35, hz, y);
    for (let x = 0; x < cols; x++) tone[y * cols + x] = t;
  }

  // Towers: a lighter row behind, a darker row in front with windows.
  const maxH = rows * 0.4;
  for (const layer of [0, 1]) {
    for (const b of skyline(cols, maxH, layer)) {
      for (let lx = 0; lx < b.w; lx++) {
        const x = b.x0 + lx;
        if (x < 0 || x >= cols) continue;
        const mid = Math.abs(lx - (b.w - 1) / 2);
        let top = hz - b.h;
        if (b.kind === 1 && (lx === 0 || lx === b.w - 1)) top += b.h * 0.12; // set-back crown
        if (b.kind === 2) top -= Math.max(0, b.w / 2 - mid) * 1.6; // pointed top
        if (b.kind === 3 && mid < 0.6) top -= 5 + b.h * 0.08; // antenna
        if (b.kind === 4) top += lx * 0.9; // sloped roof
        for (let y = Math.max(0, Math.floor(top)); y < hz; y++) {
          let t: number;
          if (layer === 0) {
            t = 0.26 + 0.06 * ((y - top) / b.h);
          } else {
            t = 0.46 + 0.1 * ((y - top) / b.h);
            const lit = lx % 3 === 1 && (hz - y) % 4 === 2 && y > top + 2 && lx < b.w - 1;
            if (lit) t -= 0.17;
          }
          tone[y * cols + x] = t;
        }
      }
    }
  }

  // Ground and road, in perspective toward the vanishing point.
  for (let y = hz; y < rows; y++) {
    const d = (y - hz + 0.5) / depth; // 0 at the horizon, 1 at the bottom
    const z = 1 / (d + 0.035);
    const half = cols * 0.44 * d + 0.4;
    const edge = 0.45 + 2.4 * d;
    const dash = 0.3 + 1.5 * d;
    const lane = (z * 1.1) % 1 < 0.5;
    for (let x = 0; x < cols; x++) {
      const dist = Math.abs(x + 0.5 - vx);
      let t: number;
      if (dist < half) {
        t = 0.6 + 0.34 * d;
        if (dist > half - edge) t = 0.1;
        else if (dist < dash && lane) t = 0.06;
      } else {
        // Verge: lighter far away, darker near, with a little texture.
        t = 0.28 + 0.4 * d + (hash(x, y, SEED + 3) - 0.5) * 0.08;
        if (dist < half * 1.06 + 0.6) t = 0.34 + 0.3 * d; // kerb
      }
      tone[y * cols + x] = t;
    }
  }

  // Dissolve upward into the paper, then dither.
  const img = ctx.createImageData(cols, rows);
  const buf = new Uint32Array(img.data.buffer);
  const fadeTo = rows * 0.36;
  for (let y = 0; y < rows; y++) {
    const fade = smooth(0, fadeTo, y);
    const by = (y & 7) * 8;
    for (let x = 0; x < cols; x++) {
      const t = Math.min(0.97, Math.max(0, tone[y * cols + x] * fade));
      const v = Math.min(n - 1, Math.floor(t * (n - 1) + BAYER[by + (x & 7)]));
      buf[y * cols + x] = pal[v];
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function SiteFooter() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    const render = () => {
      raf = 0;
      const r = scene.getBoundingClientRect();
      const c = Math.max(8, Math.ceil(r.width / PIXEL));
      const h = Math.max(8, Math.ceil(r.height / PIXEL));
      if (c === cols && h === rows) return;
      cols = c;
      rows = h;
      paint(canvas, cols, rows);
    };
    render();
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(render);
    });
    ro.observe(scene);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <footer className="relative overflow-hidden bg-white">
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pt-20 sm:px-8 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href="/"
              aria-label="RidePerks, inicio"
              className="inline-block text-[var(--ink)] transition-opacity duration-200 hover:opacity-75"
            >
              <span className="rpx-lockup h-7 sm:h-8" />
            </Link>
            <div className="mt-8 flex items-center gap-2.5">
              <a
                href="mailto:soporte@rideperks.app"
                className="rpx-btn inline-flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] pl-4 pr-5 text-[15px] font-semibold text-white"
              >
                <Mail size={17} strokeWidth={1.75} aria-hidden="true" />
                Contáctanos
              </a>
              <a
                href="https://www.instagram.com/rideperks/"
                target="_blank"
                rel="noreferrer"
                aria-label="RidePerks en Instagram"
                className="rpx-btn flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink)] ring-1 ring-inset ring-[var(--line)] hover:bg-[var(--surface)]"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">{col.title}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[15px] text-[var(--muted)] transition-colors duration-200 hover:text-[var(--ink)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--faint)] sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 RidePerks · Panamá</p>
          <p>Hecho para quienes manejan</p>
        </div>
      </div>
      <div ref={sceneRef} aria-hidden="true" className="rpx-scene relative -mt-4 h-[clamp(240px,30vw,420px)]">
        <canvas ref={canvasRef} />
      </div>
    </footer>
  );
}
