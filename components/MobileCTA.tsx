"use client";

// Phone-only floating call to action: one tap gets a driver to sign-up from
// anywhere on the page once the hero is behind them. Leaves again once #unete
// has been reached (and stays gone past it, e.g. at the footer) so it doesn't
// sit on top of the very call to action it points to.
//
// Always mounted so it can slide in and out: enters on the iOS drawer curve,
// exits faster than it enters.
import { useEffect, useState } from "react";
import PillLink from "@/components/landing/PillLink";

export default function MobileCTA() {
  const [pastHero, setPastHero] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById("unete");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setReachedEnd(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !reachedEnd;

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={
        "fixed inset-x-0 bottom-0 z-40 px-4 transition-[transform,opacity] ease-drawer sm:hidden " +
        (show
          ? "translate-y-0 opacity-100 duration-[400ms]"
          : "pointer-events-none translate-y-[calc(100%+1rem)] opacity-0 duration-200")
      }
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="lp-glass rounded-full p-1.5">
        <PillLink href="/register" className="w-full">
          Crear mi cuenta
        </PillLink>
      </div>
    </div>
  );
}
