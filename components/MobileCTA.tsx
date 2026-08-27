"use client";

// Phone-only sticky bottom bar: one tap gets a driver to the waitlist
// form from anywhere on the page, instead of making them scroll through
// every section first. Disappears once #waitlist itself has been reached
// (and stays gone past it, e.g. at the footer) so it doesn't sit on top
// of the very form it points to.
import { useEffect, useState } from "react";

export default function MobileCTA() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("waitlist");
    if (!target) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setVisible(false);
        }
      },
      { threshold: 0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pt-3 shadow-[0_-8px_30px_-12px_rgba(4,20,41,0.25)] backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#waitlist"
        className="flex w-full items-center justify-center rounded-full bg-ember px-6 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        Únete a la lista de espera
      </a>
    </div>
  );
}
