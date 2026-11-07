"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Subtle fade-up on first scroll into view. Renders a plain div when the
 * user prefers reduced motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
