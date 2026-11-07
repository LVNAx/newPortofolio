"use client";

import { useCallback, type PointerEvent } from "react";
import { QuarterCircle } from "@/components/shared/Decorators";
import Reveal from "@/components/shared/Reveal";
import { skillGroups } from "@/data/portfolio";
import "./ailab.css";

const corner = [
  { color: "sky", rotate: 90 },
  { color: "saffron", rotate: 90 },
  { color: "coral", rotate: 90 },
  { color: "vivid", rotate: 90 },
] as const;

/** Layer sizes for the little feed-forward net drawn behind each card. */
const LAYERS = [
  [3, 4, 4, 2],
  [2, 4, 3, 3],
  [4, 3, 4, 2],
  [3, 5, 3, 1],
];

function NeuralPattern({ variant }: { variant: number }) {
  const layers = LAYERS[variant % LAYERS.length];
  const x0 = 70;
  const dx = 70;
  const cols = layers.map((n, li) =>
    Array.from({ length: n }, (_, k) => ({ x: x0 + li * dx, y: 150 + (k - (n - 1) / 2) * 46 })),
  );
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 300"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100"
      style={{
        WebkitMaskImage: "radial-gradient(120% 90% at 100% 100%, #000 30%, transparent 75%)",
        maskImage: "radial-gradient(120% 90% at 100% 100%, #000 30%, transparent 75%)",
      }}
    >
      <g stroke="#5ee6ff" strokeOpacity="0.35" strokeWidth="0.8" fill="none">
        {cols.slice(0, -1).flatMap((col, li) =>
          col.flatMap((a, ai) =>
            cols[li + 1].map((b, bi) => (
              <path key={`${li}-${ai}-${bi}`} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} className="nk-net-line" />
            )),
          ),
        )}
      </g>
      {cols.flat().map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="#0b102d" stroke="#5ee6ff" strokeOpacity="0.8" className="nk-net-node" />
      ))}
    </svg>
  );
}

/** The four skill groups as glass cards with a cyan glow + animated net on hover. */
export default function SkillCards() {
  const onMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      {skillGroups.map((g, i) => (
        <li key={g.title}>
          <Reveal delay={i * 0.08} className="h-full">
            <article
              onPointerMove={onMove}
              aria-labelledby={`skill-${i}`}
              className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent-cyan/45 hover:shadow-[0_0_0_1px_rgba(94,230,255,0.15),0_24px_70px_-20px_rgba(94,230,255,0.35)] sm:p-7 lg:rounded-[28px]"
            >
              <div aria-hidden className="nk-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <NeuralPattern variant={i} />
              <QuarterCircle
                size={44}
                color={corner[i % corner.length].color}
                rotate={corner[i % corner.length].rotate}
                className="absolute right-0 top-0 opacity-90 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125"
              />

              <div className="relative flex items-baseline gap-2 font-mono text-[12px]">
                <span className="text-accent-cyan">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-white/25">/ {String(skillGroups.length).padStart(2, "0")}</span>
              </div>
              <h4 id={`skill-${i}`} className="relative mt-8 text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[24px]">
                {g.title}
              </h4>
              <p className="relative mt-2.5 text-[14.5px] leading-relaxed text-white/60">{g.blurb}</p>
              <ul className="relative mt-auto flex flex-wrap gap-1.5 pt-6">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="rounded-full border border-white/10 bg-navy-900/60 px-2.5 py-1 font-mono text-[11px] text-white/75 transition-colors duration-300 group-hover:border-accent-cyan/25"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
