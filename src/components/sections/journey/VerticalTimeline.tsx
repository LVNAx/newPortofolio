"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";
import { journey } from "@/data/portfolio";
import StageCard from "./StageCard";
import { accentFor, startYear } from "./stage";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Mobile / tablet / reduced-motion timeline: a vertical rail that draws
 * itself as you scroll (framer-motion useScroll), with a node per stage.
 * Shown below 1024px, and on desktop when the user prefers reduced motion.
 */
export default function VerticalTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 65%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-8 lg:motion-safe:hidden">
      <ol ref={listRef} className="relative flex flex-col gap-14 pl-9 sm:gap-20 sm:pl-14">
        {/* rail */}
        <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-[2px] rounded-full bg-primary/12 sm:left-[19px]" />
        <motion.span
          aria-hidden
          style={reduce ? undefined : { scaleY: draw }}
          className="absolute bottom-2 left-[11px] top-2 w-[2px] origin-top rounded-full bg-linear-to-b from-primary via-accent-sky to-accent-cyan sm:left-[19px]"
        />

        {journey.map((s, i) => {
          const a = accentFor(i);
          return (
            <li key={s.school} className="relative">
              {/* node */}
              <motion.span
                aria-hidden
                className={cn(
                  "absolute -left-9 top-1 grid size-6 place-items-center rounded-full bg-surface-alt sm:-left-14 sm:size-10",
                )}
                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className={cn("absolute inset-0 rounded-full ring-2 ring-primary/25")} />
                <span className={cn("size-2.5 rounded-full sm:size-3.5", a.solid)} />
              </motion.span>

              {/* year label */}
              <motion.div
                className="mb-4 flex items-baseline gap-3"
                initial={reduce ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="text-[26px] font-extrabold leading-none tracking-tight tabular-nums text-ink sm:text-[32px]">
                  {startYear(s)}
                </span>
                <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{s.name}</span>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <StageCard stage={s} index={i} total={journey.length} variant="stack" />
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
