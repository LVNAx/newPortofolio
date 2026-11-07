"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export type FilterTabProps = {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

/**
 * Ghost/tab "filter chip" (reference: events & portfolio category filters).
 * Selected = soft sky wash + teal text; unselected = muted grey.
 */
export default function FilterTab({
  active = false,
  onClick,
  className,
  children,
}: FilterTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={clsx(
        "min-w-max rounded-lg border-0 px-4 py-3 text-sm font-semibold transition-all hover:text-primary md:px-6 md:text-[16px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active ? "bg-accent-sky/15 text-primary" : "text-ink-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
