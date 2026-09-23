"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string }) => string;
  remove: (id: string) => void;
};

// Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. The widget
// adds a hidden cf-turnstile-response input to the surrounding form.
export default function Turnstile() {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready || !key || !host.current) return;
    const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (!api) return;
    const id = api.render(host.current, { sitekey: key });
    return () => api.remove(id);
  }, [ready, key]);
  if (!key) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={host} />
    </>
  );
}
