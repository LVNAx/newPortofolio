"use client";

import { MotionConfig } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects, projectCategories } from "@/data/portfolio";
import { SECTION_IDS } from "@/data/site";
import { Highlight } from "@/components/shared/SectionHeading";
import Reveal from "./FadeIn";
import { CardDeco, DotGrid, MosaicLeft, MosaicRight, PuzzlePiece, QuarterCircle } from "@/components/shared/Decorators";
import Flagship from "./Flagship";
import AllWork from "./AllWork";
import ProjectModal from "./ProjectModal";
import { categoryLabel } from "./utils";

type OpenProjectEvent = CustomEvent<{ slug?: string }>;

/**
 * Projects section
 * A) flagship showcase (featured projects, scroll-linked parallax)
 * B) filterable archive grid of every project
 * C) case-study modal — also opened from anywhere via
 *    window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: { slug } }))
 */
export default function Projects() {
  const featured = useMemo(() => projects.filter((p) => p.featured), []);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback((slug: string, trigger?: HTMLElement | null) => {
    if (!projects.some((p) => p.slug === slug)) return;
    returnFocusRef.current =
      trigger ?? (typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null);
    setOpenSlug(slug);
  }, []);
  const close = useCallback(() => setOpenSlug(null), []);
  const navigate = useCallback((slug: string) => setOpenSlug(slug), []);

  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const slug = (e as OpenProjectEvent).detail?.slug;
      if (typeof slug === "string") open(slug);
    };
    window.addEventListener("portfolio:open-project", onOpenEvent);
    return () => window.removeEventListener("portfolio:open-project", onOpenEvent);
  }, [open]);

  const current = openSlug ? (projects.find((p) => p.slug === openSlug) ?? null) : null;
  const counts = projectCategories
    .filter((c) => c.key !== "all")
    .map((c) => ({ key: c.key, n: projects.filter((p) => p.category === c.key).length }));
  const liveCount = projects.filter((p) => (p.links?.length ?? 0) > 0).length;

  return (
    <section
      id={SECTION_IDS.projects}
      data-nav-theme="light"
      aria-labelledby="projects-heading"
      className="relative overflow-x-clip bg-surface-alt pt-24 sm:pt-28 lg:pt-36"
    >
      <MotionConfig reducedMotion="user">
      {/* ---------- decorative corners ---------- */}
      <MosaicRight className="absolute top-0 right-0 h-auto w-[150px] sm:w-[220px] lg:w-[260px]" />
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 h-[420px] w-[55%] [mask-image:radial-gradient(70%_70%_at_0%_0%,#000,transparent)]">
        <DotGrid opacity={0.14} gap={18} radius={1.6} />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        {/* ---------- header ---------- */}
        <header className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden className="h-px w-8 bg-current opacity-60" />
              Projects
            </p>
            <h2
              id="projects-heading"
              className="mt-5 text-[44px] leading-[1.02] font-extrabold tracking-tight text-ink sm:text-[64px] lg:text-[84px]"
            >
              Things I&apos;ve{" "}
              <span className="relative inline-block">
                <Highlight>shipped</Highlight>
                <svg
                  aria-hidden
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-3 w-full sm:-bottom-2 sm:h-4"
                >
                  <path d="M2 12 C 70 2, 160 2, 298 10" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-accent-saffron" />
                </svg>
              </span>
              <span className="text-primary">.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-ink-muted sm:text-[19px]">
              AI first, interface always — agents that execute instead of advise, models tuned to the
              last decimal, and the products people actually use around them.
            </p>
          </Reveal>

          {/* summary card — every number is counted from the projects array */}
          <Reveal className="lg:col-span-4" delay={0.1}>
            <div className="relative overflow-hidden rounded-[28px] bg-navy-900 p-6 text-white shadow-[0_20px_50px_-20px_rgba(11,16,45,0.5)] sm:p-7">
              <QuarterCircle size={96} color="primary" rotate={90} className="absolute -top-px -right-px opacity-60" />
              <QuarterCircle size={48} color="sky" rotate={90} className="absolute top-0 right-0 opacity-80" />
              <p className="text-[13px] font-medium text-white/60">At a glance</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-[52px] leading-none font-extrabold tracking-tight tabular-nums">{projects.length}</span>
                <span className="text-[16px] font-semibold text-white/80">projects</span>
              </p>
              <p className="mt-2 text-[14px] leading-snug text-white/65">
                <span className="font-semibold text-accent-saffron">{featured.length} flagship</span> ·{" "}
                {liveCount} with public links
              </p>
              <ul className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
                {counts.map((c) => (
                  <li key={c.key} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3 text-[14px]">
                      <span className="font-medium text-white/80">{categoryLabel(c.key as Exclude<typeof c.key, "all">)}</span>
                      <span className="font-bold tabular-nums">{c.n}</span>
                    </div>
                    <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-accent-sky"
                        style={{ width: `${(c.n / Math.max(1, projects.length)) * 100}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </header>

        {/* ---------- A) flagship ---------- */}
        <div className="mt-24 sm:mt-28 lg:mt-36">
          <SubHeading
            title="Flagship work"
            note={`${featured.length} selected projects`}
            lead="The builds I'd walk you through first. Visit the live product where there is one, or open the case study for the details."
          />
          <div className="mt-24 sm:mt-28">
            <Flagship projects={featured} onOpen={open} />
          </div>
        </div>
      </div>

      {/* ---------- B) all work (white slanted band) ---------- */}
      <div className="relative mt-32 pt-24 pb-40 sm:mt-40 sm:pb-48 lg:mt-48 lg:pt-40 lg:pb-56">
        <div aria-hidden className="bg-slant absolute inset-0" />
        <MosaicLeft className="absolute bottom-0 left-0 h-auto w-[130px] sm:w-[190px] lg:w-[230px]" />
        <CardDeco className="absolute top-16 -right-10 hidden opacity-80 md:block lg:top-28" />
        <PuzzlePiece color="coral" className="absolute right-[8%] bottom-12 h-12 w-12 -rotate-12 sm:h-16 sm:w-16" opacity={0.9} />
        <PuzzlePiece color="primary" className="absolute top-24 left-[44%] hidden h-10 w-10 rotate-[24deg] lg:block" opacity={0.15} />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <SubHeading
            title="The full archive"
            note="Filter by track"
            lead="Every build — agents, models and the web products around them. Open any card for the full case study."
          />
          <Reveal className="mt-10">
            <AllWork projects={projects} onOpen={open} />
          </Reveal>
        </div>
      </div>

      <ProjectModal
        project={current}
        list={projects}
        onClose={close}
        onNavigate={navigate}
        returnFocusTo={returnFocusRef}
      />
      </MotionConfig>
    </section>
  );
}

function SubHeading({ title, note, lead }: { title: string; note: string; lead?: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-primary shadow-[0_10px_24px_-10px_rgba(47,65,153,0.8)]"
        >
          <span className="absolute -right-5 -bottom-5 h-10 w-10 rounded-full bg-accent-saffron" />
        </span>
        <h3 className="text-[24px] leading-tight font-extrabold tracking-tight text-ink sm:text-[30px]">{title}</h3>
        <span aria-hidden className="hidden h-px flex-1 bg-linear-to-r from-primary/30 to-transparent sm:block" />
        <span className="hidden text-[13px] font-medium text-ink-faint sm:inline">{note}</span>
      </div>
      {lead && <p className="mt-4 max-w-xl text-[15.5px] leading-[1.65] text-ink-muted">{lead}</p>}
    </Reveal>
  );
}
