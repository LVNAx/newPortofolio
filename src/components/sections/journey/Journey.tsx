"use client";

import { MapPin } from "lucide-react";
import { SECTION_IDS, profile } from "@/data/site";
import { journey } from "@/data/portfolio";
import { DotGrid, MoonCorner, QuarterCircle, TileCluster } from "@/components/shared/Decorators";
import { Highlight } from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import HorizontalTimeline from "./HorizontalTimeline";
import VerticalTimeline from "./VerticalTimeline";
import Experience from "./Experience";

/**
 * Journey: SMP → SMA → University as a pinned horizontal timeline on
 * desktop (vertical drawn rail on mobile / reduced motion), followed by
 * current experience.
 */
export default function Journey() {
  const first = journey[0]?.period.split("—")[0].trim();

  return (
    <section
      id={SECTION_IDS.journey}
      data-nav-theme="light"
      aria-labelledby="journey-title"
      className="relative isolate overflow-x-clip bg-surface-alt pb-24 pt-24 sm:pb-32 sm:pt-32"
    >
      {/* ---------- decor ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <MoonCorner className="absolute right-0 top-0 h-auto w-[150px] sm:w-[220px] lg:w-[300px]" opacity={0.22} />
        <TileCluster className="absolute bottom-0 left-0 h-auto w-[220px] sm:w-[320px] lg:w-[420px]" opacity={0.14} />
        <div className="absolute left-0 top-0 h-[520px] w-full [mask-image:radial-gradient(60%_70%_at_20%_20%,black,transparent)]">
          <DotGrid opacity={0.16} gap={16} radius={1.6} />
        </div>
        <QuarterCircle size={72} color="saffron" rotate={180} className="absolute left-[46%] top-40 hidden opacity-60 lg:block" />
      </div>

      {/* ---------- header ---------- */}
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-8">
        <Reveal>
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Journey
          </p>
        </Reveal>

        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <Reveal className="lg:col-span-8" delay={0.05}>
            <h2
              id="journey-title"
              className="text-[42px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[64px] lg:text-[84px]"
            >
              From Pontianak to <Highlight>Fasilkom&nbsp;UI</Highlight>
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-[1.65] text-ink-muted sm:text-[18px]">
              Three schools, one through-line: discipline first, competition next, then building things people use.
              Here is how the chapters connect.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.12}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-primary/10 bg-primary/10">
              <div className="bg-surface px-4 py-4">
                <dt className="text-[13px] font-medium text-ink-muted">Schools</dt>
                <dd className="mt-1.5 text-[26px] font-extrabold leading-none tabular-nums text-ink">{journey.length}</dd>
              </div>
              <div className="bg-surface px-4 py-4">
                <dt className="text-[13px] font-medium text-ink-muted">Since</dt>
                <dd className="mt-1.5 text-[26px] font-extrabold leading-none tabular-nums text-ink">{first}</dd>
              </div>
              <div className="col-span-2 bg-surface px-4 py-4">
                <dt className="sr-only">Location</dt>
                <dd className="flex items-start gap-2.5 text-[13px] leading-[1.55] text-ink-muted">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-coral" strokeWidth={2.2} />
                  {profile.location}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>

      {/* ---------- timeline ---------- */}
      <div className="mt-16 sm:mt-20 lg:mt-12">
        <HorizontalTimeline />
        <VerticalTimeline />
      </div>

      {/* ---------- experience ---------- */}
      <Experience />
    </section>
  );
}
