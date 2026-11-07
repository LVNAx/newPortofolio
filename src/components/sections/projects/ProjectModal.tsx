"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/portfolio";
import { CardDeco } from "@/components/shared/Decorators";
import { ProjectMedia } from "./ProjectMedia";
import { CategoryChip, HighlightList, MetricBadge, StackChips } from "./parts";
import { categoryLabel, getLenis, pad2, rgb, useHydrated } from "./utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function ProjectModal({
  project,
  list,
  onClose,
  onNavigate,
  returnFocusTo,
}: {
  project: Project | null;
  list: Project[];
  onClose: () => void;
  onNavigate: (slug: string) => void;
  /** Element to focus when the dialog closes (falls back to whatever was focused on open). */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const hydrated = useHydrated();

  if (!hydrated) return null;
  return createPortal(
    <AnimatePresence>
      {project && (
        <ModalShell
          key="project-modal"
          project={project}
          list={list}
          onClose={onClose}
          onNavigate={onNavigate}
          returnFocusTo={returnFocusTo}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ModalShell({
  project: p,
  list,
  onClose,
  onNavigate,
  returnFocusTo,
}: {
  project: Project;
  list: Project[];
  onClose: () => void;
  onNavigate: (slug: string) => void;
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion() ?? false;
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const idx = Math.max(0, list.findIndex((x) => x.slug === p.slug));
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  const titleId = `project-modal-title`;

  // Keep latest callbacks for the key handler without re-binding.
  const handlers = useRef({ onClose, onNavigate, prev: prev.slug, next: next.slug });
  useEffect(() => {
    handlers.current = { onClose, onNavigate, prev: prev.slug, next: next.slug };
  });

  /* open / close side effects: scroll lock (Lenis + native), focus in & out */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const restoreTarget = returnFocusTo;
    const lenis = getLenis();
    lenis?.stop();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevPad = html.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;

    const raf = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));

    return () => {
      cancelAnimationFrame(raf);
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPad;
      getLenis()?.start();
      const target = restoreTarget?.current ?? previouslyFocused;
      if (target && document.contains(target)) target.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  /* keyboard: ESC, focus trap, arrow navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const h = handlers.current;
      if (e.key === "Escape") {
        e.preventDefault();
        h.onClose();
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        e.preventDefault();
        h.onNavigate(e.key === "ArrowLeft" ? h.prev : h.next);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null || n === document.activeElement,
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* reset scroll when switching project */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [p.slug]);

  const a = rgb(p.accent);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-navy-950/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.35 }}
        onClick={onClose}
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[94dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-t-[28px] bg-surface-alt shadow-[0_60px_120px_-40px_rgba(5,8,26,0.8)] sm:max-h-[90dvh] sm:rounded-[32px]"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.97 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: reduce ? 0.01 : 0.55, ease: EASE }}
      >
        {/* close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-lg ring-1 ring-navy-900/10 backdrop-blur transition-transform duration-300 hover:rotate-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:top-5 sm:right-5"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* scrollable body */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="scrollbar-modal relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.slug}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE }}
            >
              {/* header media */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-900 sm:aspect-[21/9]">
                <ProjectMedia project={p} size="hero" hideTitle priority />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{ background: "linear-gradient(to top, rgba(11,16,45,0.55), transparent)" }}
                />
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 sm:top-6 sm:left-8">
                  <CategoryChip project={p} />
                </div>
                {p.metric && (
                  <div className="absolute right-4 bottom-4 hidden sm:right-8 sm:bottom-6 sm:block">
                    <MetricBadge metric={p.metric} accent={p.accent} size="md" />
                  </div>
                )}
              </div>

              <div className="relative px-5 pt-8 pb-10 sm:px-10 sm:pt-10">
                <p className="font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
                  {"// case study"} · {pad2(idx + 1)}/{pad2(list.length)}
                </p>
                <h2
                  id={titleId}
                  className="mt-3 text-[36px] leading-[1.02] font-extrabold tracking-tight text-ink sm:text-[52px]"
                >
                  {p.title}
                </h2>
                <p className="mt-3 max-w-3xl text-[18px] leading-[1.45] font-semibold text-ink sm:text-[20px]">
                  {p.tagline}
                </p>

                {p.metric && (
                  <div className="mt-5 flex sm:hidden">
                    <MetricBadge metric={p.metric} accent={p.accent} size="md" />
                  </div>
                )}

                <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <SectionLabel>overview</SectionLabel>
                    <p className="mt-3 text-[15.5px] leading-[1.75] text-ink-muted">{p.description}</p>

                    <SectionLabel className="mt-9">highlights</SectionLabel>
                    <HighlightList items={p.highlights} accent={p.accent} className="mt-4" itemClassName="text-[15px]" />
                  </div>

                  <aside className="relative">
                    <CardDeco className="absolute -top-10 -right-12 hidden opacity-70 lg:block" />
                    <div className="relative rounded-[24px] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(11,16,45,0.35)] ring-1 ring-primary/10">
                      <span
                        aria-hidden
                        className="absolute top-0 left-6 h-1 w-16 rounded-b-full"
                        style={{ background: p.accent, boxShadow: `0 4px 14px rgba(${a},0.6)` }}
                      />
                      <dl className="flex flex-col gap-4">
                        <Meta label="context" value={p.context} />
                        <Meta label="role" value={p.role} />
                        <div className="grid grid-cols-2 gap-4">
                          <Meta label="year" value={p.year} />
                          <Meta label="track" value={categoryLabel(p.category)} />
                        </div>
                        {p.metric && <Meta label="metric" value={`${p.metric.value} — ${p.metric.label}`} />}
                      </dl>

                      <SectionLabel className="mt-6">stack</SectionLabel>
                      <StackChips stack={p.stack} className="mt-3" />

                      {p.links && p.links.length > 0 && (
                        <>
                          <SectionLabel className="mt-6">links</SectionLabel>
                          <ul className="mt-3 flex flex-col gap-2">
                            {p.links.map((l) => (
                              <li key={l.href}>
                                <a
                                  href={l.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/l flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                  {l.label}
                                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/l:translate-x-0.5 group-hover/l:-translate-y-0.5" aria-hidden />
                                  <span className="sr-only">(opens in a new tab)</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* prev / next */}
        <nav
          aria-label="Other projects"
          className="relative z-10 grid grid-cols-2 border-t border-primary/10 bg-white"
        >
          <NavButton dir="prev" project={prev} onClick={() => onNavigate(prev.slug)} />
          <NavButton dir="next" project={next} onClick={() => onNavigate(next.slug)} />
        </nav>
      </motion.div>
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={clsx("font-mono text-[11px] tracking-[0.16em] text-primary uppercase", className)}>
      {"// "}
      {children}
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase">{label}</dt>
      <dd className="mt-1 text-[14.5px] leading-[1.45] font-semibold text-ink">{value}</dd>
    </div>
  );
}

function NavButton({
  dir,
  project,
  onClick,
}: {
  dir: "prev" | "next";
  project: Project;
  onClick: () => void;
}) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group/nav flex min-w-0 items-center gap-3 px-4 py-4 transition-colors hover:bg-primary-light focus-visible:bg-primary-light focus-visible:outline-none sm:px-8 sm:py-5",
        isPrev ? "justify-start border-r border-primary/10 text-left" : "justify-end text-right",
      )}
    >
      {isPrev && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-primary transition-transform duration-300 group-hover/nav:-translate-x-1">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase">
          {isPrev ? "Previous" : "Next"}
        </span>
        <span className="truncate text-[14px] font-bold text-ink sm:text-[15px]">{project.title}</span>
      </span>
      {!isPrev && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-primary transition-transform duration-300 group-hover/nav:translate-x-1">
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </button>
  );
}
