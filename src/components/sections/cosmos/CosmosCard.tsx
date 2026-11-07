"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DotGrid, QuarterCircle } from "@/components/shared/Decorators";
import type { Achievement } from "@/data/portfolio";
import ConstellationGlyph from "./ConstellationGlyph";
import { type ConstellationDef, centroidOf, formatRaDec } from "./constellations";

export type CosmosEntry = { achievement: Achievement; def: ConstellationDef };

const KIND: Record<Achievement["kind"], { label: string; cls: string }> = {
  olympiad: { label: "Olympiad", cls: "text-accent-saffron border-accent-saffron/40 bg-accent-saffron/10" },
  ai: { label: "AI", cls: "text-accent-cyan border-accent-cyan/40 bg-accent-cyan/10" },
  data: { label: "Data science", cls: "text-accent-sky-soft border-accent-sky/40 bg-accent-sky/10" },
  academic: { label: "Academic", cls: "text-accent-coral-soft border-accent-coral/40 bg-accent-coral/10" },
};

const STAGE: Record<Achievement["stage"], string> = {
  SMP: "Junior high",
  SMA: "Senior high",
  University: "University",
};

const ease = [0.16, 1, 0.3, 1] as const;

/** Glass card for the achievement pinned to the active constellation. */
export default function CosmosCard({
  entry,
  index,
  total,
  origin,
  previewing,
}: {
  entry: CosmosEntry;
  index: number;
  total: number;
  /** The OSN Astronomy card — the origin story. */
  origin: boolean;
  /** True while the card follows a hover rather than the selected constellation. */
  previewing: boolean;
}) {
  const reduce = useReducedMotion();
  const { achievement: a, def } = entry;
  const c = centroidOf(def);
  const coords = formatRaDec(c[0], c[1], c[2]);
  const kind = KIND[a.kind];
  const nn = String(index + 1).padStart(2, "0");

  return (
    <div
      id="cosmos-card"
      className="relative overflow-hidden rounded-[28px] border border-white/12 bg-navy-900/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)] backdrop-blur-xl"
    >
      {/* hackvidia geometry, dimmed for the night canvas */}
      <QuarterCircle size={112} color="saffron" rotate={90} className="absolute -right-px -top-px opacity-[0.14]" />
      <QuarterCircle size={56} color="sky" rotate={270} className="absolute bottom-0 left-0 opacity-[0.12]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 [mask-image:linear-gradient(to_top,black,transparent)]">
        <DotGrid opacity={0.35} gap={12} radius={1.1} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-accent-saffron/60 to-transparent"
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={def.name}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: reduce ? 0.15 : 0.38, ease }}
          className="relative flex min-h-[318px] flex-col p-6 sm:p-7"
        >
          <header className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
              <span className="text-accent-saffron">★ {nn}</span>
              <span className="text-white/30"> / {String(total).padStart(2, "0")} · </span>
              {def.name}
              {previewing && <span className="text-white/35"> · preview</span>}
            </p>
            {origin ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-saffron/50 bg-accent-saffron/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-saffron">
                <Sparkles className="size-3" aria-hidden />
                Origin story
              </span>
            ) : (
              <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${kind.cls}`}>
                {kind.label}
              </span>
            )}
          </header>

          <div className="mt-6 flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <h3 className="text-[34px] font-bold leading-[1.02] tracking-tight text-white sm:text-[40px]">{a.title}</h3>
              <p className="mt-2 text-[16px] font-semibold leading-snug text-white/90">{a.event}</p>
            </div>
            <ConstellationGlyph
              key={def.name}
              def={def}
              draw
              stroke={1.6}
              scale={1.15}
              className="mt-1 size-[72px] shrink-0 sm:size-[84px]"
            />
          </div>

          <ul className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/70">
            <li className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1">{a.level}</li>
            {a.year && <li className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1">{a.year}</li>}
            <li className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1">{STAGE[a.stage]}</li>
          </ul>

          <p className="mt-4 text-[14.5px] leading-relaxed text-white/65">{a.note}</p>

          <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/10 pt-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
            <span>
              {def.abbr} · {def.meaning}
            </span>
            <span className="tabular-nums">
              RA {coords.ra} · Dec {coords.dec}
            </span>
          </footer>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
