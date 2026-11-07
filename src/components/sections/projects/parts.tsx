import clsx from "clsx";
import type { Project } from "@/data/portfolio";
import { HighlightGlyph } from "./Geometry";
import { categoryTag } from "./utils";

export function StackChips({
  stack,
  max,
  tone = "light",
  className,
}: {
  stack: string[];
  /** Show at most `max` chips plus a "+n" counter. */
  max?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const shown = max ? stack.slice(0, max) : stack;
  const rest = stack.length - shown.length;
  const chip =
    tone === "light"
      ? "border-primary/15 bg-white text-ink/80"
      : "border-white/15 bg-white/5 text-white/80";
  return (
    <ul className={clsx("flex flex-wrap gap-1.5", className)} aria-label="Tech stack">
      {shown.map((s) => (
        <li
          key={s}
          className={clsx("rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none whitespace-nowrap", chip)}
        >
          {s}
        </li>
      ))}
      {rest > 0 && (
        <li
          className="rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] leading-none text-white"
          aria-label={`${rest} more`}
        >
          +{rest}
        </li>
      )}
    </ul>
  );
}

export function CategoryChip({ project, className }: { project: Project; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-ink uppercase shadow-sm backdrop-blur",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} aria-hidden />
      {categoryTag[project.category]}
    </span>
  );
}

export function MetricBadge({
  metric,
  accent,
  size = "md",
  className,
}: {
  metric: NonNullable<Project["metric"]>;
  accent: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-stretch overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-20px_rgba(11,16,45,0.45)] ring-1 ring-primary/10",
        className,
      )}
    >
      <span aria-hidden className="w-1.5 shrink-0" style={{ background: accent }} />
      <div className={clsx("flex flex-col", size === "sm" ? "px-3 py-2" : size === "md" ? "px-4 py-3" : "px-5 py-4")}>
        <span
          className={clsx(
            "font-mono leading-none font-bold tracking-tight text-ink",
            size === "sm" ? "text-[17px]" : size === "md" ? "text-[24px]" : "text-[32px] sm:text-[40px]",
          )}
        >
          {metric.value}
        </span>
        <span
          className={clsx(
            "mt-1 font-mono tracking-wide text-ink-muted uppercase",
            size === "sm" ? "text-[9.5px]" : "text-[10.5px]",
          )}
        >
          {metric.label}
        </span>
      </div>
    </div>
  );
}

export function HighlightList({
  items,
  accent,
  className,
  itemClassName,
}: {
  items: string[];
  accent: string;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ul className={clsx("flex flex-col gap-3", className)}>
      {items.map((h, i) => (
        <li key={h} className={clsx("flex gap-3 text-[14.5px] leading-[1.6] text-ink/85", itemClassName)}>
          <HighlightGlyph accent={accent} index={i} />
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}
