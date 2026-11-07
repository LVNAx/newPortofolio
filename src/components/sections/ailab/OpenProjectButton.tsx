"use client";

import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

/**
 * Opens a project's detail modal via the cross-section contract (see SPEC.md).
 * We deliberately don't scroll first: the Projects modal locks Lenis, which
 * would freeze a scroll that is still in flight.
 */
export function openProject(slug: string) {
  window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: { slug } }));
}

export default function OpenProjectButton({
  slug,
  label = "Open case study",
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openProject(slug)}
      className={clsx(
        "group/cta inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[14px] font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan",
        className,
      )}
    >
      {label}
      <ArrowUpRight
        aria-hidden
        className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
      />
    </button>
  );
}
