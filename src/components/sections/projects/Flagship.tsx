"use client";

import clsx from "clsx";
import { ArrowUpRight, Plus } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef } from "react";
import type { Project } from "@/data/portfolio";
import { PuzzlePiece } from "@/components/shared/Decorators";
import { TileField } from "./Geometry";
import { ProjectMedia } from "./ProjectMedia";
import { HighlightList, MetricBadge, StackChips } from "./parts";
import { categoryLabel, pad2, rgb } from "./utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const textParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const textChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function Flagship({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (slug: string, trigger?: HTMLElement | null) => void;
}) {
  return (
    <div className="flex flex-col gap-24 sm:gap-28 lg:gap-40">
      {projects.map((p, i) => (
        <FlagshipRow key={p.slug} project={p} index={i} total={projects.length} onOpen={onOpen} />
      ))}
    </div>
  );
}

function FlagshipRow({
  project: p,
  index,
  total,
  onOpen,
}: {
  project: Project;
  index: number;
  total: number;
  onOpen: (slug: string, trigger?: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const reverse = index % 2 === 1;
  const a = rgb(p.accent);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  // Reduced motion: pin the "effective" progress to 0.5, where every
  // parallax transform below is neutral (no offset, no clip). Driven by a
  // motion value so server and client markup stay identical.
  const motionOn = useMotionValue(1);
  useEffect(() => {
    motionOn.set(reduce ? 0 : 1);
  }, [reduce, motionOn]);
  const progress = useTransform([smooth, motionOn], ([v, on]: number[]) => (on ? v : 0.5));

  const tilesY = useTransform(progress, [0, 1], [70, -70]);
  const tilesRotate = useTransform(progress, [0, 1], [reverse ? 3 : -3, reverse ? -3 : 3]);
  const imageY = useTransform(progress, [0, 1], ["-7%", "7%"]);
  const badgeY = useTransform(progress, [0, 1], [60, -60]);
  const numberY = useTransform(progress, [0, 1], [90, -90]);
  const inset = useTransform(progress, [0.08, 0.38], [12, 0], { clamp: true });
  const radius = useTransform(progress, [0.08, 0.38], [56, 32], { clamp: true });
  const clip = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round ${radius}px)`;

  const shownHighlights = p.highlights.slice(0, 5);
  const titleId = `flagship-${p.slug}-title`;

  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      className="relative grid items-center gap-16 lg:grid-cols-12"
    >
      {/* ---------------- media ---------------- */}
      <div className={clsx("relative lg:col-span-7", reverse && "lg:order-2")}>
        {/* giant index number */}
        <motion.span
          aria-hidden
          style={{ y: numberY }}
          className={clsx(
            "pointer-events-none absolute -top-16 font-sans text-[120px] leading-none font-extrabold tracking-tighter text-primary/[0.07] select-none sm:-top-24 sm:text-[180px] lg:-top-28 lg:text-[220px]",
            reverse ? "right-0 lg:-right-6" : "left-0 lg:-left-6",
          )}
        >
          {pad2(index + 1)}
        </motion.span>

        {/* accent tile backdrop */}
        <motion.div
          aria-hidden
          style={{ y: tilesY, rotate: tilesRotate }}
          className={clsx(
            "absolute -bottom-6 h-[78%] w-[70%] overflow-hidden rounded-[32px] sm:-bottom-10",
            reverse ? "-left-3 sm:-left-8" : "-right-3 sm:-right-8",
          )}
        >
          <div className="absolute inset-0" style={{ background: `rgba(${a},0.14)` }} />
          <TileField seed={`${p.slug}-flag`} accent={p.accent} cols={5} rows={4} tone="light" density={0.85} className="absolute inset-0 h-full w-full" />
        </motion.div>

        <PuzzlePiece
          color={index % 3 === 0 ? "saffron" : index % 3 === 1 ? "sky" : "coral"}
          className={clsx(
            "absolute -top-7 z-[2] h-14 w-14 rotate-12 drop-shadow-[0_10px_20px_rgba(11,16,45,0.25)] sm:h-16 sm:w-16",
            reverse ? "right-[8%] sm:right-[38%]" : "left-[66%] sm:left-[42%]",
          )}
        />

        {/* frame */}
        <motion.div
          style={{ clipPath: clip }}
          className="group/frame relative z-[1] aspect-[16/11] overflow-hidden rounded-[32px] bg-navy-900 shadow-[0_40px_90px_-30px_rgba(11,16,45,0.55)] ring-1 ring-navy-900/10 sm:aspect-[16/10]"
        >
          <motion.div
            style={{ y: imageY }}
            className="absolute -inset-y-[8%] inset-x-0"
          >
            <ProjectMedia
              project={p}
              size="hero"
              hideTitle
              imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/frame:scale-[1.04]"
            />
          </motion.div>

          {/* window chrome */}
          <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-linear-to-b from-navy-950/70 to-transparent px-4 pt-3 pb-6 sm:px-5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-coral" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-saffron" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan" aria-hidden />
            <span className="ml-2 truncate font-mono text-[11px] text-white/80">~/projects/{p.slug}</span>
          </div>

          {/* agent console HUD */}
          <div className="absolute bottom-4 left-4 hidden max-w-[78%] rounded-2xl border border-white/10 bg-navy-950/75 p-4 font-mono text-[11px] leading-[1.7] text-white/75 shadow-2xl backdrop-blur-xl sm:block lg:bottom-5 lg:left-5">
            <p className="text-white">
              <span style={{ color: p.accent }}>$</span> nugraha inspect {p.slug}
            </p>
            <p>
              <span className="inline-block w-14 text-white/45">role</span>
              {p.role}
            </p>
            <p className="truncate">
              <span className="inline-block w-14 text-white/45">stack</span>
              {p.stack.slice(0, 3).join(" · ")}
              {p.stack.length > 3 && <span className="text-white/45"> +{p.stack.length - 3}</span>}
            </p>
            <p>
              <span className="inline-block w-14 text-white/45">year</span>
              {p.year}
              <span className="ml-1.5 inline-block h-3 w-1.5 translate-y-0.5 animate-cursor-blink bg-accent-cyan motion-reduce:animate-none" aria-hidden />
            </p>
          </div>
        </motion.div>

        {/* metric badge */}
        {p.metric && (
          <motion.div
            style={{ y: badgeY }}
            className={clsx(
              "absolute -bottom-8 z-[3] sm:bottom-auto sm:top-10",
              reverse ? "left-4 sm:-left-6" : "right-4 sm:-right-6",
            )}
          >
            <MetricBadge metric={p.metric} accent={p.accent} size="lg" />
          </motion.div>
        )}
      </div>

      {/* ---------------- text ---------------- */}
      <motion.div
        className={clsx("relative lg:col-span-5", reverse && "lg:order-1")}
        variants={textParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        <motion.div variants={textChild} className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-[0.14em] uppercase">
          <span className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-3 py-1.5 text-white">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent, boxShadow: `0 0 10px rgba(${a},0.9)` }} aria-hidden />
            Flagship {pad2(index + 1)}/{pad2(total)}
          </span>
          <span className="text-ink-muted">{categoryLabel(p.category)}</span>
        </motion.div>

        <motion.h4
          variants={textChild}
          id={titleId}
          className="mt-5 font-sans text-[40px] leading-[1.02] font-extrabold tracking-tight text-ink sm:text-[52px] lg:text-[60px]"
        >
          {p.title}
        </motion.h4>

        <motion.p variants={textChild} className="mt-4 text-[19px] leading-[1.45] font-semibold text-ink sm:text-[21px]">
          {p.tagline}
        </motion.p>

        <motion.dl
          variants={textChild}
          className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-y border-primary/10 py-4 font-mono text-[12px] leading-[1.5]"
        >
          <dt className="text-ink-faint">context</dt>
          <dd className="text-ink">{p.context}</dd>
          <dt className="text-ink-faint">role</dt>
          <dd className="text-ink">{p.role}</dd>
          <dt className="text-ink-faint">year</dt>
          <dd className="text-ink">{p.year}</dd>
        </motion.dl>

        <motion.p variants={textChild} className="mt-5 text-[15px] leading-[1.7] text-ink-muted">
          {p.description}
        </motion.p>

        <motion.div variants={textChild}>
          <HighlightList items={shownHighlights} accent={p.accent} className="mt-6" />
        </motion.div>

        <motion.div variants={textChild}>
          <StackChips stack={p.stack} className="mt-6" />
        </motion.div>

        <motion.div variants={textChild} className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={(e) => onOpen(p.slug, e.currentTarget)}
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary py-3 pr-3 pl-6 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(47,65,153,0.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-haspopup="dialog"
          >
            Case study
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 transition-transform duration-500 group-hover/cta:rotate-90">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </button>
          {p.links?.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {l.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ))}
        </motion.div>
      </motion.div>
    </article>
  );
}
