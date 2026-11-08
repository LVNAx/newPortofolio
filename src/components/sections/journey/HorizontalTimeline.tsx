"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { journey } from "@/data/portfolio";
import { profile } from "@/data/site";
import StageCard from "./StageCard";
import { startYear } from "./stage";

/** Must match the CSS gate on the wrapper (`hidden lg:motion-safe:block`). */
export const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * Desktop timeline: the viewport pins and the stage cards travel
 * horizontally while a progress rail fills across the top.
 * Cards are 82vw wide and the track is padded by (100vw − card) / 2 on both
 * sides, so card i is centred exactly at progress i / (n − 1) — which is
 * where its year marker sits on the rail.
 */
export default function HorizontalTimeline() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const n = journey.length;
  // "Depok, Indonesia · from Pontianak, the Equator City" → Pontianak → Depok
  const [here, home] = profile.location.split("·").map((s) => s.trim());
  const origin = home?.replace(/^from\s+/i, "").split(",")[0] || "Pontianak";
  const destination = here?.split(",")[0] || "Depok";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(PIN_QUERY, () => {
      const pin = pinRef.current;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!pin || !track || !fill) return;

      const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);

      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Sits low on the page: refresh after pins/scenes created above it.
          refreshPriority: -1,
        },
        onUpdate() {
          const p = tl.progress();
          if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
          const idx = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        },
      });

      tl.to(track, { x: () => -distance() }, 0)
        .fromTo(fill, { scaleX: 0 }, { scaleX: 1 }, 0);
      if (ghostRef.current) tl.to(ghostRef.current, { xPercent: -38 }, 0);

      // Photo parallax and card focus while each card crosses the viewport.
      const cards = gsap.utils.toArray<HTMLElement>("[data-stage-card]", track);
      cards.forEach((card) => {
        const img = card.querySelector<HTMLElement>("[data-parallax]");
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tl,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        }
        gsap.fromTo(
          card,
          { scale: 0.92, opacity: 0.45 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tl,
              start: "left 95%",
              end: "center 55%",
              scrub: true,
            },
          },
        );
      });

      return () => {
        activeRef.current = 0;
        setActive(0);
      };
    });

    return () => mm.revert();
  }, [n]);

  return (
    <div className="hidden lg:motion-safe:block">
      <div ref={pinRef} className="relative flex h-svh flex-col overflow-hidden">
        {/* giant ghost route, drifts slower than the cards */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[6vh] overflow-hidden">
          <div
            ref={ghostRef}
            className="whitespace-nowrap pl-[6vw] text-[19vw] font-extrabold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(47,65,153,0.10)]"
          >
            {origin} <span className="text-primary/[0.05] [-webkit-text-stroke:0]">→</span> {destination}
          </div>
        </div>

        {/* progress rail */}
        <div className="relative z-10 mx-auto w-[82vw] max-w-[1180px] pt-[104px] [@media(max-height:780px)]:pt-[88px]">
          <div className="flex items-center justify-between text-[13px] font-medium text-ink-muted">
            <span>
              {origin} <span className="text-ink-faint">to</span> {destination}
            </span>
            <span aria-hidden className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" strokeWidth={2.2} />
                Keep scrolling
              </span>
              <span className="h-3 w-px bg-primary/20" />
              <span ref={pctRef} className="min-w-[4ch] text-right font-semibold tabular-nums text-ink">
                0%
              </span>
            </span>
          </div>

          <div className="relative mt-9 h-[2px] rounded-full bg-primary/12">
            <div
              ref={fillRef}
              className="absolute inset-0 origin-left scale-x-0 rounded-full bg-linear-to-r from-primary via-accent-sky to-accent-cyan"
            />
            <ol aria-label="Journey years" className="absolute inset-0">
              {journey.map((s, i) => {
                const reached = i <= active;
                const pos = n > 1 ? (i / (n - 1)) * 100 : 0;
                return (
                  <li
                    key={s.school}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${pos}%` }}
                  >
                    <div
                      className={cn(
                        "absolute bottom-3 whitespace-nowrap text-[14px] font-bold tabular-nums transition-colors duration-500",
                        i === 0 ? "left-0" : i === n - 1 ? "right-0" : "left-1/2 -translate-x-1/2",
                        reached ? "text-ink" : "text-ink-faint",
                      )}
                    >
                      {startYear(s)}
                    </div>
                    <span
                      aria-hidden
                      className={cn(
                        "block size-3.5 rounded-full border-2 transition-[background-color,border-color,box-shadow,scale] duration-500",
                        i === 0 ? "translate-x-0" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2",
                        i === active
                          ? "scale-125 border-primary bg-primary shadow-[0_0_0_6px_rgba(79,139,255,0.18)]"
                          : reached
                            ? "border-primary bg-primary"
                            : "border-primary/30 bg-surface-alt",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-4 whitespace-nowrap text-[13px] font-medium transition-colors duration-500",
                        i === 0 ? "left-0" : i === n - 1 ? "right-0" : "left-1/2 -translate-x-1/2",
                        i === active ? "font-semibold text-primary" : "text-ink-faint",
                      )}
                    >
                      {s.name}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* track */}
        <div className="relative z-10 flex flex-1 items-center pb-[4vh] pt-12 [@media(max-height:780px)]:pt-10">
          <ol
            ref={trackRef}
            className="flex items-stretch gap-[6vw] px-[calc((100vw-min(82vw,1180px))/2)] will-change-transform"
          >
            {journey.map((s, i) => (
              <li
                key={s.school}
                className="h-[min(600px,calc(100svh-250px))] w-[min(82vw,1180px)] shrink-0 [@media(max-height:780px)]:h-[calc(100svh-218px)]"
              >
                <StageCard stage={s} index={i} total={n} variant="wide" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
