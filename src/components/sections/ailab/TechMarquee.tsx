import clsx from "clsx";
import { techMarquee } from "@/data/portfolio";
import "./ailab.css";

const half = Math.ceil(techMarquee.length / 2);
const rowA = [...techMarquee];
const rowB = [...techMarquee.slice(half), ...techMarquee.slice(0, half)];

/** Tiny geometric separators — the hackvidia tile language at chip scale. */
function Glyph({ i, tone }: { i: number; tone: "light" | "dark" }) {
  const shapes = ["rounded-full", "rounded-none", "rounded-tl-full", "rotate-45 rounded-[1px]"];
  const darkColors = ["bg-accent-cyan", "bg-accent-saffron", "bg-accent-coral", "bg-accent-sky"];
  const lightColors = ["bg-navy-900", "bg-surface", "bg-accent-saffron", "bg-navy-900"];
  const colors = tone === "dark" ? darkColors : lightColors;
  return (
    <span
      aria-hidden
      className={clsx("mx-4 inline-block h-2.5 w-2.5 shrink-0 sm:mx-5", shapes[i % 4], colors[(i + 1) % 4])}
    />
  );
}

function Row({
  items,
  reverse,
  tone,
  duration,
}: {
  items: string[];
  reverse?: boolean;
  tone: "light" | "dark";
  duration: string;
}) {
  const chip = clsx(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-1.5 font-mono text-[12px] font-medium tracking-wide sm:px-5 sm:py-2 sm:text-[13px]",
    tone === "light"
      ? "border-navy-900/15 bg-white/25 text-navy-950"
      : "border-white/15 bg-white/[0.04] text-white/80",
  );
  const renderItems = (copy: number) =>
    items.map((name, i) => (
      <li key={`${copy}-${name}`} className="flex shrink-0 items-center">
        <span className={chip}>{name}</span>
        <Glyph i={i} tone={tone} />
      </li>
    ));

  return (
    <div className="nk-marquee py-3 sm:py-3.5">
      <div
        className="nk-marquee-track"
        data-reverse={reverse ? "true" : "false"}
        style={{ ["--nk-dur" as string]: duration }}
      >
        <ul className="flex shrink-0 items-center">{renderItems(0)}</ul>
        <ul aria-hidden className="flex shrink-0 items-center">
          {renderItems(1)}
        </ul>
      </div>
    </div>
  );
}

/**
 * Two crossing "tapes" of tech chips that straddle the boundary between the
 * light About canvas and the navy AI Lab. Pure CSS animation (paused on
 * hover, static under prefers-reduced-motion).
 */
export default function TechMarquee() {
  return (
    <div role="region" aria-label="Technologies I work with" className="relative z-20 -mt-16 sm:-mt-20">
      <div className="relative h-[150px] sm:h-[164px]">
        <div className="absolute inset-x-[-6%] top-[64%] -translate-y-1/2 rotate-[1.6deg] border-y border-white/10 bg-navy-950 shadow-[0_20px_50px_-20px_rgba(5,8,26,0.8)]">
          <Row items={rowB} reverse tone="dark" duration="70s" />
        </div>
        <div className="absolute inset-x-[-6%] top-[38%] -translate-y-1/2 -rotate-[2.4deg] bg-accent-sky shadow-[0_24px_60px_-24px_rgba(79,139,255,0.7)]">
          <Row items={rowA} tone="light" duration="55s" />
        </div>
      </div>
    </div>
  );
}
