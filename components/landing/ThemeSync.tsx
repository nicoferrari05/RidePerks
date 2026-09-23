"use client";
import { useEffect } from "react";
import { applyTheme, clearTheme, storedTheme } from "./theme";

// Re-applies the stored theme on client-side navigation between landing
// pages (the inline script only runs on a full load) and removes it when
// leaving, so the platform and sign-in pages are never tinted.
export default function ThemeSync() {
  useEffect(() => {
    applyTheme(storedTheme());
    return () => clearTheme();
  }, []);
  return null;
}
