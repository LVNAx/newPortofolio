import { cn } from "@/lib/cn";

/**
 * Hypomonē mark (ported from Hypomonē @HACK `LogoMark`): two rounded pillars
 * joined by a leaf-shaped crossbar (two quarter circles) plus a saffron dot,
 * recoloured to the navy palette. viewBox 48×48.
 * `tone="dark"` = placed on a navy canvas, `"light"` = on white.
 * Tiles nudge apart when an ancestor `.group` is hovered (see layout.css).
 */
export default function Monogram({
  tone = "dark",
  className,
  title,
}: {
  tone?: "dark" | "light";
  className?: string;
  /** Accessible name; omit when the monogram sits next to visible text. */
  title?: string;
}) {
  const pillar = tone === "dark" ? "fill-white" : "fill-navy-900";
  const bar = tone === "dark" ? "fill-accent-sky" : "fill-primary-vivid";
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("nk-mono shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect data-t="a" x="3" y="3" width="13" height="42" rx="3.5" className={pillar} />
      <rect data-t="b" x="32" y="3" width="13" height="42" rx="3.5" className={pillar} />
      {/* leaf crossbar: quarter circle up-left + quarter circle down-right */}
      <path data-t="d" d="M24 24 H16 A8 8 0 0 1 24 16 Z" className={bar} />
      <path data-t="d" d="M24 24 H32 A8 8 0 0 1 24 32 Z" className={bar} />
      <rect x="16" y="20.5" width="16" height="7" className={pillar} />
      <circle data-t="b" cx="38.5" cy="9.5" r="2.5" className="fill-accent-saffron" />
    </svg>
  );
}
