"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { projects } from "@/data/portfolio";

const bdc = projects.find((p) => p.slug === "bdc-waste");
/** "F1 score of 99.5695 on the test set — top 70 nationally" → "99.5695" */
const f1 = bdc?.highlights.join(" ").match(/99\.\d+/)?.[0] ?? bdc?.metric?.value ?? "";

/** Every stage restates facts from the bdc-waste entry in portfolio.ts. */
const STAGES: { title: string; note: string; items: string[]; tone: string }[] = [
  {
    title: "Input",
    note: "Waste photos, three classes",
    items: ["Recyclable", "Organic", "Electronic"],
    tone: "bg-accent-saffron",
  },
  {
    title: "Frozen backbones",
    note: "Embeddings only — no fine-tuning",
    items: ["DINOv2", "SigLIP"],
    tone: "bg-accent-sky",
  },
  {
    title: "Lightweight heads",
    note: "Benchmarked against each other",
    items: ["Logistic Regression", "kNN", "MLP"],
    tone: "bg-accent-coral",
  },
];

/**
 * How the waste classifier is built, as a clean three-stage pipeline card
 * with the final test F1 filling in once the card scrolls into view.
 */
export default function VisionPipeline() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const filled = reduce || inView;
  const score = parseFloat(f1);

  return (
    <figure
      ref={ref}
      className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-7 lg:rounded-[28px]"
    >
      <figcaption className="text-[16px] font-semibold text-white sm:text-[17px]">How the classifier is built</figcaption>

      <ol className="relative mt-6 flex flex-col gap-3">
        {STAGES.map((s, i) => (
          <li key={s.title} className="relative">
            {i > 0 && (
              <span aria-hidden className="absolute -top-3 left-[22px] h-3 w-px bg-white/15 sm:left-[26px]" />
            )}
            <div className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-navy-950/50 p-4 sm:p-5">
              <span
                aria-hidden
                className={`mt-0.5 h-3 w-3 shrink-0 ${s.tone} ${i === 0 ? "rounded-full" : i === 1 ? "rounded-none" : "rounded-tl-full"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="text-[15px] font-semibold text-white">{s.title}</span>
                  <span className="text-[13px] text-white/50">{s.note}</span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12.5px] font-medium text-white/80"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* result */}
      {f1 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[13px] font-medium text-white/55">Best test F1</span>
            <span className="text-[22px] font-extrabold tracking-tight text-accent-cyan tabular-nums">{f1}</span>
          </div>
          <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full origin-left rounded-full bg-linear-to-r from-accent-sky to-accent-cyan transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${filled && !Number.isNaN(score) ? score / 100 : 0})` }}
            />
          </div>
        </div>
      )}
    </figure>
  );
}
