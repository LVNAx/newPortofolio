import clsx from "clsx";
import { ArrowUpRight, CodeXml, Globe } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { HighlightGlyph } from "./Geometry";
import { categoryTag, linkCta, linkHost } from "./utils";

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
          className={clsx("rounded-full border px-2.5 py-1.5 text-[12px] leading-none font-medium whitespace-nowrap", chip)}
        >
          {s}
        </li>
      ))}
      {rest > 0 && (
        <li
          className="rounded-full bg-primary px-2.5 py-1.5 text-[12px] leading-none font-semibold text-white"
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
        "inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-ink shadow-sm backdrop-blur",
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
            "leading-none font-extrabold tracking-tight text-ink tabular-nums",
            size === "sm" ? "text-[17px]" : size === "md" ? "text-[24px]" : "text-[32px] sm:text-[40px]",
          )}
        >
          {metric.value}
        </span>
        <span
          className={clsx(
            "mt-1 leading-snug font-medium text-ink-muted",
            size === "sm" ? "text-[11px]" : "text-[12.5px]",
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

/**
 * External project link as a button. `variant="primary"` is the filled,
 * prominent style used for the first link of a project; links always open
 * in a new tab.
 */
export function ProjectLinkButton({
  link,
  variant = "primary",
  showHost = false,
  className,
}: {
  link: NonNullable<Project["links"]>[number];
  variant?: "primary" | "outline" | "dark";
  /** Print the destination host under the label (e.g. "bemui.site"). */
  showHost?: boolean;
  className?: string;
}) {
  const isCode = /github/i.test(link.href);
  const Icon = isCode ? CodeXml : Globe;
  const styles =
    variant === "primary"
      ? "bg-primary text-white shadow-[0_14px_30px_-12px_rgba(47,65,153,0.7)] hover:bg-primary-hover"
      : variant === "dark"
        ? "bg-navy-900 text-white shadow-[0_14px_30px_-14px_rgba(11,16,45,0.7)] hover:bg-navy-800"
        : "border border-primary/20 bg-white text-primary hover:border-primary hover:bg-primary-light";
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "group/link relative inline-flex items-center gap-2.5 rounded-full py-3 pr-4 pl-5 text-[15px] font-semibold transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:hover:translate-y-0",
        styles,
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <span className="flex min-w-0 flex-col leading-tight">
        <span>{linkCta(link.label, link.href)}</span>
        {showHost && (
          <span className={clsx("truncate text-[12px] font-medium", variant === "outline" ? "text-ink-faint" : "text-white/65")}>
            {linkHost(link.href)}
          </span>
        )}
      </span>
      <ArrowUpRight
        className="ml-auto h-4 w-4 shrink-0 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
        aria-hidden
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
