"use client";

import clsx from "clsx";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { projectCategories, type Project, type ProjectCategory } from "@/data/portfolio";
import ProjectCard from "./ProjectCard";

type Key = ProjectCategory | "all";
const EASE = [0.16, 1, 0.3, 1] as const;

/** Filterable grid of every project (hackvidia FilterTab look + animated pill). */
export default function AllWork({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (slug: string, trigger?: HTMLElement | null) => void;
}) {
  const [active, setActive] = useState<Key>("all");
  const reduce = useReducedMotion() ?? false;
  const panelId = "projects-grid";

  const count = (k: Key) => (k === "all" ? projects.length : projects.filter((p) => p.category === k).length);
  const visible = active === "all" ? projects : projects.filter((p) => p.category === active);

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = projectCategories.findIndex((c) => c.key === active);
    const n = projectCategories.length;
    const nextIdx = (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    setActive(projectCategories[nextIdx].key);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIdx];
    btn?.focus();
  };

  return (
    <div>
      {/* filter tabs */}
      <LayoutGroup id="projects-filters">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            onKeyDown={onTabKey}
            className="inline-flex min-w-max gap-1 rounded-2xl bg-white p-1.5 shadow-[0_14px_40px_-24px_rgba(11,16,45,0.35)] ring-1 ring-primary/10"
          >
            {projectCategories.map((c) => {
              const on = c.key === active;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={panelId}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(c.key)}
                  className={clsx(
                    "relative min-w-max rounded-lg px-4 py-3 text-sm font-semibold transition-colors md:px-6 md:text-[16px]",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    on ? "text-primary" : "text-ink-muted hover:text-primary",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="projects-filter-pill"
                      className="absolute inset-0 rounded-lg bg-accent-sky/15"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative inline-flex items-center gap-2">
                    {c.label}
                    <span
                      className={clsx(
                        "rounded-md px-1.5 py-0.5 font-mono text-[10.5px] leading-none",
                        on ? "bg-primary text-white" : "bg-surface-alt text-ink-faint",
                      )}
                    >
                      {count(c.key)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </LayoutGroup>

      <p className="sr-only" aria-live="polite">
        {`${visible.length} projects shown`}
      </p>

      {/* grid */}
      <motion.ul
        id={panelId}
        role="tabpanel"
        layout={!reduce}
        className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-7"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
              transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : Math.min(i, 6) * 0.04 }}
              className="h-full"
            >
              <ProjectCard project={p} onOpen={onOpen} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
