"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useId, useRef } from "react";
import { Highlight } from "@/components/shared/SectionHeading";

/** The highlighted "acts" with a hand-drawn underline that draws itself in. */
export default function ActsWord() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const gid = `acts-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap">
      <Highlight tone="sky">acts</Highlight>
      <svg
        aria-hidden
        viewBox="0 0 200 26"
        className="pointer-events-none absolute -bottom-[0.14em] left-[-2%] h-auto w-[104%] overflow-visible"
      >
        <defs>
          <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4f8bff" />
            <stop offset="100%" stopColor="#5ee6ff" />
          </linearGradient>
        </defs>
        <motion.path
          d="M3 17 C 38 6, 72 22, 108 12 S 172 5, 197 13"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: reduce || inView ? 1 : 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
}
