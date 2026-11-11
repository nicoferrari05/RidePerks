"use client";
import { useEffect } from "react";

// The landing has a single light theme. The attribute on <html> paints the
// page background mint (globals.css) and is removed when leaving, so the
// platform and sign-in pages are never tinted.
export default function ThemeSync() {
  useEffect(() => {
    document.documentElement.dataset.lpTheme = "light";
    return () => {
      delete document.documentElement.dataset.lpTheme;
    };
  }, []);
  return null;
}
