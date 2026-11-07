"use client";

import clsx from "clsx";
import { useInView, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/portfolio";
import "./ailab.css";

type Tok = "k" | "fn" | "cls" | "str" | "num" | "com" | "p" | "out" | "res";
type Line = [Tok, string][];

const tone: Record<Tok, string> = {
  k: "text-accent-coral",
  fn: "text-accent-sky-soft",
  cls: "text-accent-cyan",
  str: "text-accent-saffron",
  num: "text-accent-saffron",
  com: "italic text-white/35",
  p: "text-white/85",
  out: "font-bold text-accent-cyan",
  res: "font-bold text-white",
};

const bdc = projects.find((p) => p.slug === "bdc-waste");
/** "F1 score of 99.5695 on the test set — top 70 nationally" → "99.5695" */
const f1 = bdc?.highlights.join(" ").match(/99\.\d+/)?.[0] ?? "99.5695";

/** Pseudo-code of the Big Data Challenge pipeline (facts from portfolio.ts only). */
const LINES: Line[] = [
  [["com", "# Big Data Challenge · Satria Data 2026"]],
  [["com", "# classes: recyclable · organic · electronic"]],
  [],
  [["k", "for "], ["p", "backbone "], ["k", "in "], ["p", "["], ["cls", "DINOv2"], ["p", ", "], ["cls", "SigLIP"], ["p", "]:"]],
  [["p", "    enc = "], ["fn", "backbone"], ["p", "(frozen="], ["k", "True"], ["p", ")  "], ["com", "# no fine-tune"]],
  [["p", "    X_tr, X_te = "], ["fn", "enc"], ["p", "(train), "], ["fn", "enc"], ["p", "(test)"]],
  [],
  [["p", "    "], ["k", "for "], ["p", "head "], ["k", "in "], ["p", "["], ["cls", "LogReg"], ["p", "(), "], ["cls", "kNN"], ["p", "(), "], ["cls", "MLP"], ["p", "()]:"]],
  [["p", "        head."], ["fn", "fit"], ["p", "(X_tr, y_tr)"]],
  [["p", "        score[head] = "], ["fn", "f1"], ["p", "(y_te, "], ["fn", "head"], ["p", "(X_te))"]],
  [],
  [["out", ">>> "], ["fn", "max"], ["p", "(score."], ["fn", "values"], ["p", "())"]],
  [["res", "F1 = "], ["num", f1], ["com", "   # top 70 nationally"]],
];

const lineLen = (l: Line) => l.reduce((n, [, t]) => n + t.length, 0);
const TOTAL = LINES.reduce((n, l) => n + lineLen(l) + 1, 0);

/** Slice the token stream to the first `count` typed characters (newlines count as one). */
function sliceTokens(count: number) {
  let left = count;
  let caretLine = -1;
  const lines: ({ t: Tok; s: string }[] | null)[] = [];
  for (let li = 0; li < LINES.length; li++) {
    if (left <= 0) {
      lines.push(null);
      continue;
    }
    const toks: { t: Tok; s: string }[] = [];
    for (const [t, s] of LINES[li]) {
      if (left <= 0) break;
      const take = s.slice(0, left);
      left -= take.length;
      toks.push({ t, s: take });
    }
    caretLine = li;
    left -= 1;
    lines.push(toks);
  }
  return { lines, caretLine };
}

/**
 * Notebook-style card that types the pipeline out once it scrolls into view.
 * Visual code is aria-hidden; the figure carries a plain-language label.
 */
export default function CodeTerminal() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const t = setTimeout(() => setCount(TOTAL), 0);
      return () => clearTimeout(t);
    }
    let n = 0;
    const reset = setTimeout(() => setCount(0), 0);
    const id = setInterval(() => {
      n = Math.min(TOTAL, n + 3);
      setCount(n);
      if (n >= TOTAL) clearInterval(id);
    }, 22);
    return () => {
      clearTimeout(reset);
      clearInterval(id);
    };
  }, [inView, reduce, run]);

  const done = count >= TOTAL;

  const rendered = useMemo(() => sliceTokens(count), [count]);

  return (
    <figure
      ref={ref}
      aria-label={`Pseudo-code of the waste classifier: frozen DINOv2 and SigLIP embeddings feed Logistic Regression, kNN and MLP heads; best test F1 ${f1}.`}
      className="relative overflow-hidden rounded-[24px] border border-white/10 bg-navy-950/80 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:rounded-[28px]"
    >
      {/* title bar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-coral/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-saffron/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-sky/80" />
        </span>
        <span className="truncate font-mono text-[11.5px] text-white/50">waste_classifier.pseudo.py</span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          disabled={!done || !!reduce}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw aria-hidden className="h-3 w-3" />
          re-run
        </button>
      </div>

      {/* code */}
      <div aria-hidden className="overflow-x-auto px-1 py-4 sm:py-5">
        <pre className="min-w-max font-mono text-[11.5px] leading-[1.75] sm:text-[13px]">
          {LINES.map((_, li) => {
            const toks = rendered.lines[li];
            return (
              <div key={li} className="flex">
                <span className="w-9 shrink-0 select-none pr-3 text-right text-white/20 sm:w-11">{li + 1}</span>
                <span className="whitespace-pre pr-5">
                  {toks?.map((tk, ti) => (
                    <span key={ti} className={tone[tk.t]}>
                      {tk.s}
                    </span>
                  ))}
                  {rendered.caretLine === li && !done && (
                    <span className="nk-caret ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-accent-cyan" />
                  )}
                  {"​"}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* result strip */}
      <div className="border-t border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="text-white/45">test F1</span>
          <span className={clsx("transition-colors duration-500", done ? "text-accent-cyan" : "text-white/30")}>
            {done ? f1 : "running…"}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full origin-left rounded-full bg-linear-to-r from-accent-sky to-accent-cyan transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `scaleX(${done ? parseFloat(f1) / 100 : (count / TOTAL) * 0.35})` }}
          />
        </div>
      </div>
    </figure>
  );
}
