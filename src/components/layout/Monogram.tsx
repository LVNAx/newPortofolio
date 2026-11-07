import { cn } from "@/lib/cn";

/**
 * "N" mark drawn only with hackvidia-style tiles — two bars bridged by a
 * diagonal, plus a saffron quarter-ring accent (viewBox 30×24).
 * `tone="dark"` = placed on a navy canvas (light strokes), `"light"` = on white.
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
  const ink = tone === "dark" ? "fill-white" : "fill-navy-900";
  return (
    <svg
      viewBox="0 0 30 24"
      className={cn("nk-mono shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* N — two bars bridged by a diagonal */}
      <polygon data-t="d" points="0,0 8,0 24,24 16,24" className="fill-accent-sky" />
      <rect data-t="a" x="0" y="0" width="7" height="24" className={ink} />
      <rect data-t="b" x="17" y="0" width="7" height="24" className="fill-primary-vivid" />
      {/* accent — saffron quarter-circle tile */}
      <path data-t="a" d="M24 0 H30 V6 A6 6 0 0 1 24 0 Z" className="fill-accent-saffron" />
      <rect data-t="d" x="26" y="18" width="4" height="6" className="fill-accent-coral" />
    </svg>
  );
}
