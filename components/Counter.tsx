"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SteeringWheelIcon } from "./icons";

type CounterData = { visible: boolean; count: number };

// Fetched from /api/counter — its "visible" flag is toggled by the
// admin at /admin. When off, this renders nothing at all.
export default function Counter() {
  const [data, setData] = useState<CounterData | null>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/counter")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setData({ visible: Boolean(json.visible), count: Number(json.count) || 0 });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data?.visible || !valueRef.current) return;
    const el = valueRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      el.textContent = String(data.count);
      return;
    }

    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: data.count,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
    });

    return () => {
      tween.kill();
    };
  }, [data]);

  if (!data?.visible) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-2 pl-3 pr-4 backdrop-blur">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ember-soft text-ember">
        <SteeringWheelIcon className="h-3.5 w-3.5" />
      </span>
      <span className="font-mono text-xs tracking-wide text-mute">
        <span ref={valueRef} className="font-semibold text-navy">
          0
        </span>{" "}
        conductores ya en la lista
      </span>
    </div>
  );
}
