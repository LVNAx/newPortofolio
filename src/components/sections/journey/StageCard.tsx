"use client";

/* eslint-disable @next/next/no-img-element -- static export, images are unoptimised */

import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";
import type { JourneyStage } from "@/data/portfolio";
import { DotGrid, GlyphMini, QuarterCircle } from "@/components/shared/Decorators";
import { accentFor } from "./stage";

type Variant = "wide" | "stack";

/**
 * Photo inside a hackvidia-style geometric frame: one oversized rounded
 * corner, flat tiles peeking out behind it and a quarter-circle cap.
 * The <img> is 116% wide so the pinned timeline can parallax it (data-parallax).
 */
function TileFrame({
  stage,
  index,
  total,
  variant,
}: {
  stage: JourneyStage;
  index: number;
  total: number;
  variant: Variant;
}) {
  const a = accentFor(index);
  return (
    <div className={cn("relative", variant === "wide" ? "h-full" : "aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:h-full md:min-h-[340px]")}>
      {/* back tiles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={cn("absolute -bottom-3 -left-3 size-20 rounded-bl-[28px] sm:size-24", a.tileA)} />
        <div className={cn("absolute -bottom-3 left-[4.25rem] h-3 w-14 sm:left-[5.25rem]", a.tileB)} />
        <QuarterCircle
          size={64}
          color={a.quarter}
          rotate={90}
          className="absolute -right-3 -top-3 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stage:-translate-y-1 group-hover/stage:translate-x-1"
        />
      </div>

      {/* photo */}
      <div
        className={cn(
          "group/photo relative h-full w-full overflow-hidden rounded-[28px] bg-primary-light",
          "rounded-tr-[96px] sm:rounded-tr-[120px]",
          "shadow-[0_24px_60px_-28px_rgba(11,16,45,0.55)] ring-1 ring-primary/10",
        )}
      >
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stage:scale-[1.04]">
          <img
            data-parallax
            src={asset(stage.photo)}
            alt={`${stage.school} — ${stage.name.toLowerCase()} years`}
            loading="lazy"
            decoding="async"
            className="absolute inset-y-0 -left-[8%] h-full w-[116%] max-w-none object-cover"
          />
        </div>
        {/* navy grade for legibility */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-navy-950/75 via-navy-900/10 to-transparent" />
        <div aria-hidden className="absolute inset-0 mix-blend-soft-light bg-linear-to-br from-accent-sky/30 to-transparent" />

        {/* caption */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
          <p className="min-w-0 text-[13px] font-medium leading-snug text-white/80">
            <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-cyan">
              {stage.name}
            </span>
            <span className="block tabular-nums">{stage.period}</span>
          </p>
          <p aria-hidden className="shrink-0 text-[14px] font-semibold tabular-nums text-white/70">
            Chapter{" "}
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-white sm:text-[40px]">
              {index + 1}
            </span>
            <span className="text-white/50"> of {total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StageCard({
  stage,
  index,
  total,
  variant,
  className,
}: {
  stage: JourneyStage;
  index: number;
  total: number;
  variant: Variant;
  className?: string;
}) {
  const a = accentFor(index);
  const wide = variant === "wide";

  return (
    <article
      data-stage-card
      aria-label={`${stage.name}: ${stage.school}, ${stage.period}`}
      className={cn(
        "group/stage relative isolate overflow-hidden rounded-[32px] border border-primary/10 bg-surface",
        "shadow-[0_20px_50px_-20px_rgba(11,16,45,0.35)] transition-[box-shadow,border-color] duration-500",
        "hover:border-primary/25 hover:shadow-[0_32px_70px_-24px_rgba(11,16,45,0.45)]",
        wide
          ? "grid h-full grid-cols-[1.02fr_1fr] gap-8 p-6 xl:gap-12 xl:p-8"
          : "flex flex-col gap-7 p-4 sm:p-6 md:grid md:grid-cols-[1fr_1.1fr] md:gap-8 md:p-7",
        className,
      )}
    >
      {/* corner dot texture */}
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 -z-10 h-40 w-56 [mask-image:radial-gradient(closest-side,black,transparent)]">
        <DotGrid opacity={0.35} gap={12} radius={1.6} />
      </div>

      <TileFrame stage={stage} index={index} total={total} variant={variant} />

      <div className={cn("flex min-h-0 flex-col", wide ? "justify-center py-2 pr-2" : "px-1 pb-1 sm:px-0")}>
        {/* logo + period */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10",
              "shadow-[0_8px_20px_-10px_rgba(11,16,45,0.35)] transition-transform duration-500 group-hover/stage:-rotate-3",
              wide ? "size-14 xl:size-16" : "size-12 sm:size-14",
            )}
          >
            <img
              src={asset(stage.logo)}
              alt={`${stage.school} logo`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1.5"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{stage.name}</p>
            <p className="text-[15px] font-bold tabular-nums text-ink sm:text-[16px]">{stage.period}</p>
          </div>
        </div>

        <h3
          className={cn(
            "mt-5 font-extrabold leading-[1.02] tracking-tight text-ink",
            wide
              ? "text-[34px] xl:text-[44px] [@media(max-height:780px)]:mt-4 [@media(max-height:780px)]:text-[30px]"
              : "text-[28px] sm:text-[34px]",
          )}
        >
          {stage.school}
        </h3>

        {/* tags */}
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Traits">
          {stage.tags.map((t) => (
            <li
              key={t}
              className={cn(
                "rounded-full px-3 py-1 text-[13px] font-medium text-ink transition-colors duration-300",
                a.soft,
                "hover:bg-primary hover:text-white",
              )}
            >
              {t}
            </li>
          ))}
        </ul>

        <p className={cn("mt-5 text-ink-muted", wide ? "text-[15px] leading-[1.65] xl:text-[16px]" : "text-[15px] leading-[1.65]")}>
          {stage.story}
        </p>

        {/* milestones */}
        <div className={cn("mt-6", wide && "[@media(max-height:780px)]:mt-4")}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">Milestones</p>
          <ul className="mt-3 flex flex-col">
            {stage.milestones.map((m) => (
              <li
                key={m}
                className={cn(
                  "group/ms flex items-center gap-3 border-t border-primary/10 py-2.5 last:border-b",
                  "text-[14.5px] font-semibold text-ink transition-colors duration-300 hover:text-primary",
                )}
              >
                <GlyphMini className="size-4 shrink-0 transition-transform duration-500 group-hover/ms:rotate-90" />
                <span className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/ms:translate-x-1">
                  {m}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
