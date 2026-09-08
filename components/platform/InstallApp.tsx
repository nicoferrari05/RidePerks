"use client";
import { useEffect } from "react";
export default function InstallApp() {
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
