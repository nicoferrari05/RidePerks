"use client";

// Landing theme (light / dark / dim), stored per browser. The attribute lives
// on <html> so the pre-paint script in LandingShell can set it before React
// renders; the CSS tokens in globals.css only apply inside `.lp`.
import { useSyncExternalStore } from "react";
import type { Theme } from "@/components/ui/apple-liquid-glass-switcher";

export const THEME_KEY = "rp_lp_theme";
const listeners = new Set<() => void>();

function current(): Theme {
  const value = document.documentElement.dataset.lpTheme;
  return value === "dark" || value === "dim" ? value : "light";
}

export function storedTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === "light" || value === "dark" || value === "dim") return value;
  } catch {
    /* Storage can be blocked; fall back to the system preference. */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.lpTheme = theme;
  listeners.forEach((listener) => listener());
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Theme still applies for this visit. */
  }
}

export function clearTheme() {
  delete document.documentElement.dataset.lpTheme;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLandingTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => "light");
}
