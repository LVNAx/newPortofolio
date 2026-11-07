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
import { categoryTag, pad2 } from "./utils";

type OpenProjectEvent = CustomEvent<{ slug?: string }>;

/**
 * 03 — PROJECTS
 * A) flagship AI showcase (featured projects, scroll-linked parallax)
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
            <p className="font-mono text-[12px] font-medium tracking-[0.2em] text-primary uppercase sm:text-[13px]">
              {"// 03 — PROJECTS"}
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
              AI first, interface always — multi-agent systems that execute instead of advise, models
              tuned to the last decimal, and the products wrapped around them.
            </p>
          </Reveal>

          {/* terminal index card */}
          <Reveal className="lg:col-span-4" delay={0.1}>
            <div className="relative overflow-hidden rounded-[28px] bg-navy-900 p-6 font-mono text-[12.5px] leading-[1.9] text-white/70 shadow-[0_20px_50px_-20px_rgba(11,16,45,0.5)]">
              <QuarterCircle size={96} color="primary" rotate={90} className="absolute -top-px -right-px opacity-60" />
              <QuarterCircle size={48} color="sky" rotate={90} className="absolute top-0 right-0 opacity-80" />
              <p className="text-white">
                <span className="text-accent-cyan">$</span> ls ./projects
              </p>
              <p>
                <span className="text-white/45">total</span> <span className="text-white">{pad2(projects.length)}</span>
              </p>
              <p>
                <span className="text-white/45">flagship</span>{" "}
                <span className="text-accent-saffron">{pad2(featured.length)}</span>
              </p>
              {counts.map((c) => (
                <p key={c.key}>
                  <span className="text-white/45">{categoryTag[c.key as keyof typeof categoryTag]}</span>{" "}
                  <span className="text-white">{pad2(c.n)}</span>
                </p>
              ))}
              <p className="mt-1 text-white">
                <span className="text-accent-cyan">&gt;</span> status: shipping
                <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-cursor-blink bg-accent-cyan motion-reduce:animate-none" aria-hidden />
              </p>
            </div>
          </Reveal>
        </header>

        {/* ---------- A) flagship ---------- */}
        <div className="mt-24 sm:mt-28 lg:mt-36">
          <SubHeading index="A" title="Flagship AI systems" note={`${pad2(featured.length)} builds · scroll`} />
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
          <SubHeading index="B" title="The full archive" note="filter · hover · open" />
          <p className="mt-4 max-w-xl text-[15.5px] leading-[1.65] text-ink-muted">
            Every build — agents, models and the web products around them. Open any card for the full
            case study.
          </p>
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

function SubHeading({ index, title, note }: { index: string; title: string; note: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-mono text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(47,65,153,0.8)]">
          {index}
        </span>
        <h3 className="text-[24px] leading-tight font-extrabold tracking-tight text-ink sm:text-[30px]">{title}</h3>
        <span aria-hidden className="hidden h-px flex-1 bg-linear-to-r from-primary/30 to-transparent sm:block" />
        <span className="hidden font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase sm:inline">{note}</span>
      </div>
    </Reveal>
  );
}
