"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type PointerEvent } from "react";
import type { Project } from "@/data/portfolio";
import { ProjectMedia } from "./ProjectMedia";
import { CategoryChip, MetricBadge, StackChips } from "./parts";
import { rgb, useMediaQuery } from "./utils";

/**
 * Grid card: cover, category chip, title, tagline, stack chips, metric.
 * Hover = lift + cursor spotlight + gentle 3D tilt (fine pointers only,
 * disabled for reduced motion). The title button is a stretched link so
 * the whole card is clickable while keeping a proper h3.
 */
export default function ProjectCard({
  project: p,
  onOpen,
}: {
  project: Project;
  onOpen: (slug: string, trigger?: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const interactive = finePointer && !reduce;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });

  const a = rgb(p.accent);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (!interactive) return;
    ry.set(((x / r.width) - 0.5) * 8);
    rx.set(-((y / r.height) - 0.5) * 8);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className="h-full [perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={interactive ? { rotateX: srx, rotateY: sry } : undefined}
        className="group/card relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_-28px_rgba(11,16,45,0.35)] ring-1 ring-primary/10 transition-[box-shadow,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:ring-2 focus-within:ring-primary hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-30px_rgba(11,16,45,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* cursor spotlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgba(${a},0.18), transparent 45%)`,
          }}
        />
        {/* accent border glow following the cursor */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] rounded-[28px] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            padding: 1,
            background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(${a},0.9), transparent 60%)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* cover */}
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
          <ProjectMedia
            project={p}
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.05]"
            className="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryChip project={p} />
              {p.featured && (
                <span className="rounded-full bg-navy-900/85 px-2.5 py-1 font-mono text-[10px] tracking-wide text-accent-saffron uppercase backdrop-blur">
                  ★ flagship
                </span>
              )}
            </div>
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 -translate-y-1 place-items-center rounded-full bg-white text-primary opacity-0 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100"
            >
              <ArrowUpRight className="h-4.5 w-4.5" />
            </span>
          </div>
          {p.metric && (
            <MetricBadge
              metric={p.metric}
              accent={p.accent}
              size="sm"
              className="absolute right-4 bottom-4 max-w-[46%]"
            />
          )}
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-ink-faint">
            {p.context} · {p.year}
          </p>
          <h4 className="mt-2 text-[22px] leading-[1.15] font-extrabold tracking-tight text-ink">
            <button
              type="button"
              onClick={(e) => onOpen(p.slug, e.currentTarget)}
              aria-haspopup="dialog"
              className="text-left after:absolute after:inset-0 after:z-[4] after:content-[''] focus-visible:outline-none"
            >
              {p.title}
            </button>
          </h4>
          <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-muted">{p.tagline}</p>

          <div className="mt-auto pt-5">
            <StackChips stack={p.stack} max={4} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
