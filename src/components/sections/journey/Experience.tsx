"use client";

/* eslint-disable @next/next/no-img-element -- static export, images are unoptimised */

import { useEffect, useId, useState, type MouseEvent } from "react";
import { ArrowDown, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";
import { experiences, type Experience as ExperienceItem } from "@/data/portfolio";
import { GlyphMini, QuarterCircle } from "@/components/shared/Decorators";
import { Highlight } from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { NAV_OFFSET, scrollToTarget } from "@/components/layout/scroll";

const isNow = (e: ExperienceItem) => /present/i.test(e.period);

/** "Apr 2026 — Present" → "Apr 2026" */
const startOf = (e: ExperienceItem) => e.period.split("—")[0].trim();

/** "Technical Staff · AI Innovation Challenge" → ["Technical Staff", "AI Innovation Challenge"] */
const splitTitle = (t: string) => {
  const [main, ...rest] = t.split("·").map((s) => s.trim());
  return [main, rest.join(" · ")] as const;
};

/** Stable anchor id for a role card. */
const cardId = (i: number) => `experience-role-${i + 1}`;

/** Logos that are photos/crests rather than transparent marks fill their tile. */
const isCoverLogo = (logo?: string) => !!logo && !logo.endsWith(".png") && !logo.endsWith(".svg");

/** Extra breathing room under the fixed navbar when jumping to a card. */
const JUMP_GAP = 32;

const ACCENT_BAR = ["bg-accent-coral", "bg-accent-sky", "bg-accent-saffron"] as const;
const QUARTER = ["coral", "sky", "saffron"] as const;

function OrgLogo({ item, className }: { item: ExperienceItem; className?: string }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10",
        className,
      )}
    >
      {item.logo ? (
        <img
          src={asset(item.logo)}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn("h-full w-full", isCoverLogo(item.logo) ? "object-cover" : "object-contain p-1.5")}
        />
      ) : (
        <span className="text-[13px] font-bold text-primary">{item.org.slice(0, 2)}</span>
      )}
    </div>
  );
}

function CurrentBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-state-success/10 px-2.5 py-1 text-[12px] font-semibold text-state-success">
      <span aria-hidden className="size-1.5 rounded-full bg-state-success" />
      Current
    </span>
  );
}

function ExperienceCard({ item, index, active }: { item: ExperienceItem; index: number; active: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const [main, sub] = splitTitle(item.title);

  return (
    <article
      id={cardId(index)}
      aria-labelledby={`${cardId(index)}-title`}
      className={cn(
        "group/exp relative isolate overflow-hidden rounded-[28px] border bg-surface p-5 sm:p-7",
        "shadow-[0_18px_44px_-24px_rgba(11,16,45,0.35)]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_60px_-24px_rgba(11,16,45,0.45)] motion-reduce:hover:translate-y-0",
        "border-primary/10",
        active && "lg:border-primary/25",
      )}
    >
      {/* left accent bar: grows on hover; full for the card in view on desktop */}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-7 left-0 top-7 w-1 origin-top scale-y-[0.25] rounded-r-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/exp:scale-y-100",
          active && "lg:scale-y-100",
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
        <OrgLogo
          item={item}
          className="size-14 shadow-[0_8px_20px_-10px_rgba(11,16,45,0.35)] transition-transform duration-500 group-hover/exp:-rotate-3 group-hover/exp:scale-105 sm:size-16"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-[12px] font-semibold text-primary">
              {item.type}
            </span>
            <span className="text-[13px] font-medium tabular-nums text-ink-muted">{item.period}</span>
            {isNow(item) && <CurrentBadge />}
          </div>

          <h4
            id={`${cardId(index)}-title`}
            className="mt-3 text-[20px] font-bold leading-[1.2] tracking-tight text-ink sm:text-[24px]"
          >
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
              "mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 px-3.5 py-1.5 text-[13px] font-semibold text-primary",
              "transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden",
            )}
          >
            {open ? "Hide details" : "Show details"}
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

/**
 * "At a glance" index: one row per role (logo, title, org, start date).
 * Each row jumps to its card; the row whose card is in view is highlighted.
 */
function AtAGlance({ active }: { active: number }) {
  const current = experiences.filter(isNow).length;

  const jump = (ev: MouseEvent<HTMLAnchorElement>, i: number) => {
    const el = document.getElementById(cardId(i));
    if (!el) return;
    ev.preventDefault();
    // scrollToTarget (Lenis when running, native otherwise) takes a raw document Y,
    // so clear the fixed navbar ourselves, plus a little air.
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET - JUMP_GAP;
    scrollToTarget(Math.max(0, top));
  };

  return (
    <nav
      aria-label="Roles at a glance"
      className="overflow-hidden rounded-[24px] border border-primary/10 bg-surface shadow-[0_18px_44px_-28px_rgba(11,16,45,0.35)]"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-primary/10 px-5 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">At a glance</p>
        <p className="text-[13px] font-medium tabular-nums text-ink-muted">
          {current} current {current === 1 ? "role" : "roles"}
        </p>
      </div>

      <ol className="flex flex-col gap-1 p-2">
        {experiences.map((e, i) => {
          const [main, sub] = splitTitle(e.title);
          const on = i === active;
          return (
            <li key={e.title}>
              <a
                href={`#${cardId(i)}`}
                onClick={(ev) => jump(ev, i)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "group/row relative flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors duration-300",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  "hover:bg-surface-alt",
                  on && "lg:bg-primary-light lg:hover:bg-primary-light",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full opacity-0 transition-opacity duration-300",
                    ACCENT_BAR[i % ACCENT_BAR.length],
                    on && "lg:opacity-100",
                  )}
                />
                <OrgLogo item={e} className="size-11 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold leading-snug text-ink">{main}</span>
                  <span className="block truncate text-[13px] leading-snug text-ink-muted">
                    {sub ? `${sub} · ${e.org}` : e.org}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-medium tabular-nums text-ink-faint">
                    {isNow(e) ? `Since ${startOf(e)}` : e.period}
                  </span>
                </span>
                <ArrowDown
                  aria-hidden
                  strokeWidth={2.2}
                  className={cn(
                    "size-4 shrink-0 transition-[color,translate] duration-300 group-hover/row:translate-y-0.5",
                    "text-ink-faint",
                    on && "lg:text-primary",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function Experience() {
  const [active, setActive] = useState(0);

  // Highlight the index row whose card sits in the reading band of the viewport.
  useEffect(() => {
    const cards = experiences
      .map((_, i) => document.getElementById(cardId(i)))
      .filter((el): el is HTMLElement => !!el);
    if (!cards.length || typeof IntersectionObserver === "undefined") return;

    const visible = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = cards.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) visible.set(i, entry.boundingClientRect.top);
          else visible.delete(i);
        }
        if (visible.size) {
          const first = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActive(first);
        }
      },
      { rootMargin: "-30% 0px -45% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative mx-auto mt-24 w-full max-w-[1180px] px-4 sm:mt-32 sm:px-8 lg:mt-36">
      {/* header */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Reveal className="lg:col-span-7">
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Experience
          </p>
          <h3 className="mt-4 text-[34px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[44px] lg:text-[52px]">
            Where I&apos;m <Highlight tone="sky">building</Highlight> right now
          </h3>
        </Reveal>
        <Reveal className="lg:col-span-5" delay={0.06}>
          <p className="max-w-md text-[15.5px] leading-[1.65] text-ink-muted sm:text-[17px] lg:pb-1.5">
            Roles I hold in parallel — on a student executive board, a competition committee and in the classroom.
          </p>
        </Reveal>
      </div>

      {/* body: sticky index + role cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-4">
          {/* top-[104px] = 72px navbar + 32px air */}
          <div className="lg:sticky lg:top-[104px]">
            <Reveal>
              <AtAGlance active={active} />
            </Reveal>
          </div>
        </div>

        <ol className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:col-span-8" aria-label="Current roles">
          {experiences.map((e, i) => (
            <li key={e.title}>
              <Reveal delay={i * 0.08}>
                <ExperienceCard item={e} index={i} active={i === active} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
