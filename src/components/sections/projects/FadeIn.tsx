"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Hydration-safe fade-up on first scroll into view. Always renders the same
 * motion.div on server and client; the section's
 * <MotionConfig reducedMotion="user"> drops the translate for users who
 * prefer reduced motion (only a short opacity fade remains).
 */
export default function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
