"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Count-up that supports decimals (shared CountUp rounds to integers).
 * Writes straight to the DOM node, so it never re-renders React per frame.
 * The real value is always exposed to assistive tech via an sr-only span.
 */
export default function StatCounter({
  value,
  decimals = 0,
  duration = 2,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const final = value.toFixed(decimals);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = final;
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, decimals, duration, final]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden className={className}>
        {(0).toFixed(decimals)}
      </span>
    </>
  );
}
