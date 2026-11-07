"use client";

/* eslint-disable @next/next/no-img-element -- static export, images are unoptimised */

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";
import { experiences, type Experience as ExperienceItem } from "@/data/portfolio";
import { GlyphMini, QuarterCircle } from "@/components/shared/Decorators";
import { Highlight } from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { pad2 } from "./stage";

const isNow = (e: ExperienceItem) => /present/i.test(e.period);

/** "Technical Staff · AI Innovation Challenge" → ["Technical Staff", "AI Innovation Challenge"] */
const splitTitle = (t: string) => {
  const [main, ...rest] = t.split("·").map((s) => s.trim());
  return [main, rest.join(" · ")] as const;
};

const ACCENT_BAR = ["bg-accent-coral", "bg-accent-sky", "bg-accent-saffron"] as const;
const QUARTER = ["coral", "sky", "saffron"] as const;

function NowBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-state-success/10 px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-state-success">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-state-success opacity-70 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-state-success" />
      </span>
      now
    </span>
  );
}

function ExperienceCard({ item, index }: { item: ExperienceItem; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const [main, sub] = splitTitle(item.title);
  const coverLogo = item.logo && !item.logo.endsWith(".png") && !item.logo.endsWith(".svg");

  return (
    <article
      className={cn(
        "group/exp relative isolate overflow-hidden rounded-[28px] border border-primary/10 bg-surface p-5 sm:p-7",
        "shadow-[0_18px_44px_-24px_rgba(11,16,45,0.35)]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_60px_-24px_rgba(11,16,45,0.45)] motion-reduce:hover:translate-y-0",
      )}
    >
      {/* left accent bar grows on hover */}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-7 left-0 top-7 w-1 origin-top scale-y-[0.25] rounded-r-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/exp:scale-y-100",
          ACCENT_BAR[index % ACCENT_BAR.length],
        )}
      />
      {/* corner tile slides in on hover */}
      <QuarterCircle
        size={88}
        color={QUARTER[index % QUARTER.length]}
        rotate={90}
        className="absolute -right-2 -top-2 -z-10 translate-x-6 -translate-y-6 opacity-0 transition-[translate,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/exp:translate-x-0 group-hover/exp:translate-y-0 group-hover/exp:opacity-20"
      />

      <div className="flex items-start gap-4 sm:gap-6">
        {/* logo */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className={cn(
              "grid size-14 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 sm:size-16",
              "shadow-[0_8px_20px_-10px_rgba(11,16,45,0.35)] transition-transform duration-500 group-hover/exp:-rotate-3 group-hover/exp:scale-105",
            )}
          >
            {item.logo ? (
              <img
                src={asset(item.logo)}
                alt={`${item.org} logo`}
                loading="lazy"
                decoding="async"
                className={cn("h-full w-full", coverLogo ? "object-cover" : "object-contain p-1.5")}
              />
            ) : (
              <span className="font-mono text-[14px] font-bold text-primary">{item.org.slice(0, 2)}</span>
            )}
          </div>
          <span aria-hidden className="font-mono text-[11px] font-bold text-ink-faint">
            {pad2(index + 1)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="rounded-full bg-primary-light px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-primary">
              {item.type}
            </span>
            <span className="font-mono text-[12px] font-medium tabular-nums text-ink-muted">{item.period}</span>
            {isNow(item) && <NowBadge />}
          </div>

          <h4 className="mt-3 text-[20px] font-bold leading-[1.2] tracking-tight text-ink sm:text-[24px]">
            {main}
            {sub && (
              <>
                <span className="text-ink-faint"> · </span>
                <span className="text-primary">{sub}</span>
              </>
            )}
          </h4>
          <p className="mt-1 text-[14.5px] font-medium text-ink-muted sm:text-[15.5px]">{item.org}</p>

          {/* mobile toggle */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary",
              "transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden",
            )}
          >
            {open ? "Hide details" : "Details"}
            <Plus
              aria-hidden
              className={cn("size-3.5 transition-transform duration-300", open && "rotate-45")}
              strokeWidth={2.6}
            />
          </button>

          {/* points: collapsible below lg, always open on desktop */}
          <div
            id={panelId}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-rows-[1fr] lg:opacity-100",
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className={cn("min-h-0 overflow-hidden", !open && "max-lg:invisible")}>
              <ul className="mt-4 flex flex-col gap-2.5 lg:mt-5">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-muted sm:text-[15px]">
                    <GlyphMini className="mt-[3px] size-4 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Experience() {
  const active = experiences.filter(isNow);
  const short = (org: string) =>
    org
      .replace("Faculty of Computer Science, Universitas Indonesia", "Fasilkom UI")
      .replace("BEM Universitas Indonesia", "BEM UI");

  return (
    <div className="relative mx-auto mt-24 grid w-full max-w-[1180px] gap-10 px-4 sm:mt-32 sm:px-8 lg:mt-36 lg:grid-cols-12 lg:gap-12">
      <Reveal className="lg:col-span-5 lg:self-start lg:sticky lg:top-28">
        <p className="font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[13px]">
          {"// now — experience"}
        </p>
        <h3 className="mt-4 text-[34px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[44px] lg:text-[52px]">
          Where I&apos;m <Highlight tone="sky">building</Highlight> right now
        </h3>
        <p className="mt-4 max-w-md text-[15.5px] leading-[1.65] text-ink-muted sm:text-[17px]">
          Roles I hold in parallel — on a student executive board, a competition committee and in the classroom.
        </p>

        {/* terminal status panel */}
        <div className="mt-8 overflow-hidden rounded-[22px] bg-navy-900 shadow-[0_24px_50px_-24px_rgba(11,16,45,0.7)] ring-1 ring-white/10">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="size-2.5 rounded-full bg-accent-coral" />
            <span className="size-2.5 rounded-full bg-accent-saffron" />
            <span className="size-2.5 rounded-full bg-accent-sky" />
            <span className="ml-3 font-mono text-[11px] text-white/40">~/nugraha — roles</span>
          </div>
          <div className="px-4 py-4 font-mono text-[12px] leading-[1.9] sm:text-[12.5px]">
            <p className="text-white/50">
              <span className="text-accent-cyan">$</span> ps --roles --status=active
            </p>
            <div className="mt-1 grid grid-cols-[auto_1fr_auto] gap-x-4 text-white/35">
              <span>PID</span>
              <span>ORG</span>
              <span>STATE</span>
            </div>
            {active.map((e, i) => (
              <div key={e.title} className="grid grid-cols-[auto_1fr_auto] gap-x-4 text-white/80">
                <span className="text-white/40">{pad2(i + 1)}</span>
                <span className="truncate">{short(e.org)}</span>
                <span className="text-accent-cyan">● running</span>
              </div>
            ))}
            <p className="mt-2 text-white/50">
              <span className="text-accent-saffron">{active.length}</span> processes active
              <span className="ml-1 inline-block h-[1.05em] w-[0.55em] translate-y-[2px] bg-accent-cyan/80 animate-cursor-blink motion-reduce:animate-none" />
            </p>
          </div>
        </div>
      </Reveal>

      <ol className="flex flex-col gap-4 sm:gap-5 lg:col-span-7">
        {experiences.map((e, i) => (
          <li key={e.title}>
            <Reveal delay={i * 0.08}>
              <ExperienceCard item={e} index={i} />
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
