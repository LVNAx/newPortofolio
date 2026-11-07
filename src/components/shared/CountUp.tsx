"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

/** Counts from 0 to `value` the first time it scrolls into view. */
export default function CountUp({
  value,
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reduce, value, duration, count]);

  // The final value lives in an sr-only span (also present in SSR/no-JS
  // HTML); the animated digits are decorative.
  return (
    <>
      <span className="sr-only">{`${value}${suffix}`}</span>
      <motion.span ref={ref} aria-hidden className={className}>
        {text}
      </motion.span>
    </>
  );
}
