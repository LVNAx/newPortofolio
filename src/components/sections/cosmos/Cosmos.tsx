"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Crosshair, Hand, Telescope } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import { Highlight } from "@/components/shared/SectionHeading";
import { DotGrid, GhostTiles, QuarterCircle } from "@/components/shared/Decorators";
import { achievements } from "@/data/portfolio";
import { SECTION_IDS } from "@/data/site";
import { cn } from "@/lib/cn";
import ConstellationGlyph from "./ConstellationGlyph";
import CosmosCard, { type CosmosEntry } from "./CosmosCard";
import StaticSky from "./StaticSky";
import { CONSTELLATIONS } from "./constellations";
import type { CosmosApi } from "./scene";
import "./cosmos.css";

/* ------------------------------------------------------------------ */

const ENTRIES: CosmosEntry[] = achievements
  .filter((a) => CONSTELLATIONS[a.constellation])
  .map((a) => ({ achievement: a, def: CONSTELLATIONS[a.constellation] }));

const ORIGIN = Math.max(
  0,
  ENTRIES.findIndex((e) => e.def.name === "Orion"),
);

const STAR_COUNT = ENTRIES.reduce((n, e) => n + e.def.stars.length, 0);

const RM_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const m = window.matchMedia(RM_QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia(RM_QUERY).matches;
const getRMServer = () => false;

type Status = "loading" | "webgl" | "fallback";

/* ------------------------------------------------------------------ */

export default function Cosmos() {
  const reduced = useSyncExternalStore(subscribeRM, getRM, getRMServer);
  const [status, setStatus] = useState<Status>("loading");
  const [focused, setFocused] = useState(ORIGIN);
  const [hovered, setHovered] = useState<number | null>(null);
  const [interacted, setInteracted] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const apiRef = useRef<CosmosApi | null>(null);
  const focusedRef = useRef(ORIGIN);

  const mode: "webgl" | "static" | "loading" = reduced || status === "fallback" ? "static" : status;
  const live = mode === "webgl";
  const active = hovered ?? focused;
  const entry = ENTRIES[active];

  const select = useCallback((i: number) => {
    focusedRef.current = i;
    setFocused(i);
    apiRef.current?.focus(i);
  }, []);

  const preview = useCallback((i: number | null) => {
    setHovered(i);
    apiRef.current?.setHover(i);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    const host = canvasHostRef.current;
    if (!stage || !host) return;
    let cancelled = false;
    let api: CosmosApi | null = null;
    import("./scene")
      .then(({ createCosmos }) => {
        if (cancelled) return;
        api = createCosmos({
          stage,
          viewport: host,
          constellations: ENTRIES.map((e) => e.def),
          labels: labelRefs.current,
          reticle: reticleRef.current,
          readout: readoutRef.current,
          initialFocus: focusedRef.current,
          onHover: (i) => setHovered(i),
          onSelect: (i) => select(i),
          onInteract: () => setInteracted(true),
        });
        if (!api) {
          setStatus("fallback");
          return;
        }
        apiRef.current = api;
        setStatus("webgl");
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      api?.dispose();
      apiRef.current = null;
    };
  }, [reduced, select]);

  const focusedEntry = ENTRIES[focused];

  return (
    <section
      id={SECTION_IDS.cosmos}
      data-nav-theme="dark"
      aria-labelledby="cosmos-title"
      className="relative isolate min-h-[118svh] overflow-clip bg-navy-950 text-white"
    >
      {/* ------------------------------------------------ sky layer */}
      <div
        ref={stageRef}
        className={cn("cosmos-stage absolute inset-0", live && "cursor-grab")}
        data-cursor-label={live ? "Drag" : undefined}
        aria-hidden
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <StaticSky
            className={cn(
              "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
              live ? "opacity-0" : "opacity-100",
            )}
          />
          <div
            ref={canvasHostRef}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              live ? "opacity-100" : "opacity-0",
            )}
          />

          {mode === "static" && (
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[14vw]">
              <ConstellationGlyph
                key={entry.def.name}
                def={entry.def}
                draw
                stroke={0.5}
                scale={0.8}
                className="size-[min(62vw,46svh)] opacity-80 drop-shadow-[0_0_18px_rgba(245,192,74,0.55)] lg:size-[min(40vw,52svh)]"
              />
            </div>
          )}

          {!reduced && (
            <>
              <div className="pointer-events-none absolute inset-0">
                {ENTRIES.map((e, i) => (
                  <div
                    key={e.def.name}
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    className="cosmos-label"
                  >
                    <span className="cosmos-label__idx">{String(i + 1).padStart(2, "0")}</span>
                    {e.def.name}
                  </div>
                ))}
              </div>
              <div ref={reticleRef} className="cosmos-reticle">
                <div data-corner="tl">
                  <span data-tag />
                </div>
                <div data-corner="tr" />
                <div data-corner="bl" />
                <div data-corner="br" />
              </div>
            </>
          )}

          {/* legibility scrims (viewport-relative) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56%] bg-linear-to-r from-navy-950/90 via-navy-950/45 to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-linear-to-b from-navy-950/85 via-navy-950/35 to-transparent lg:hidden" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_45%,transparent_55%,rgba(5,8,26,0.7)_100%)]" />
        </div>
      </div>

      {/* section edges: emerge from / sink into darkness */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-linear-to-b from-navy-950 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-linear-to-t from-navy-950 via-navy-950/70 to-transparent" />

      {/* hackvidia geometry, ghosted for night */}
      <GhostTiles className="pointer-events-none absolute -right-24 top-24 z-[1] hidden h-auto w-[440px] lg:block" opacity={0.045} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-[1] flex opacity-[0.22]">
        <QuarterCircle size={64} color="primary" rotate={270} />
        <QuarterCircle size={64} color="sky" rotate={180} className="opacity-70" />
      </div>
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-[1] opacity-[0.18]">
        <QuarterCircle size={88} color="saffron" rotate={90} />
      </div>

      {/* ------------------------------------------------ overlay content */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[118svh] max-w-[1280px] flex-col px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-20 lg:pt-32">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-6 xl:col-span-5">
            <p className="font-mono text-[12.5px] uppercase tracking-[0.24em] text-accent-sky">
              {"// 04 — COSMOS"}
            </p>
            <h2
              id="cosmos-title"
              className="mt-4 text-[40px] font-bold leading-[1.02] tracking-tight text-white sm:text-[54px] lg:text-[66px]"
            >
              Before models, I read the{" "}
              <Highlight tone="saffron" className="[text-shadow:0_0_36px_rgba(245,192,74,0.45)]">
                stars
              </Highlight>
              .
            </h2>
            <p className="mt-5 max-w-[34rem] text-[16px] leading-relaxed text-white/70 lg:text-[17px]">
              I placed third in the provincial National Science Olympiad (OSN) in Astronomy. Home is Pontianak —{" "}
              <em className="not-italic text-white/90">Kota Khatulistiwa</em>, the city on the equator — where both Ursa
              Major and the Southern Cross (Crux) share the same night. Every achievement since is a star I&apos;ve added
              to that sky.
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
              <span>
                <span className="text-accent-saffron">{ENTRIES.length}</span> constellations
              </span>
              <span aria-hidden className="text-white/20">/</span>
              <span>
                <span className="text-accent-saffron">{STAR_COUNT}</span> real stars
              </span>
              <span aria-hidden className="text-white/20">/</span>
              <span>J2000 coordinates</span>
            </p>
          </Reveal>

          {/* observatory readout */}
          <Reveal className="hidden lg:col-span-4 lg:col-start-9 lg:block" delay={0.15}>
            <div className="relative ml-auto mt-2 max-w-[340px] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] p-4 font-mono text-[11px] leading-[1.9] text-white/50 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]">
                <DotGrid opacity={0.4} gap={10} radius={0.9} />
              </div>
              <p className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40">
                <Telescope className="size-3.5 text-accent-cyan" aria-hidden />
                sky.observer
                <span className="ml-auto inline-flex items-center gap-1.5 text-accent-cyan">
                  <span className={cn("size-1.5 rounded-full bg-accent-cyan", live && "cosmos-live")} />
                  {live ? "live" : "static"}
                </span>
              </p>
              <dl className="relative mt-2 grid grid-cols-[auto_1fr] gap-x-4">
                <dt className="text-accent-cyan/80">&gt; observer</dt>
                <dd className="text-white/80">Pontianak · lat ≈ 0°</dd>
                <dt className="text-accent-cyan/80">&gt; view</dt>
                <dd className="tabular-nums text-white/80">
                  <span ref={readoutRef}>{live ? "aligning…" : "static chart"}</span>
                </dd>
                <dt className="text-accent-cyan/80">&gt; target</dt>
                <dd className="text-white/80">
                  {entry.def.name.toUpperCase()}{" "}
                  <span className={hovered !== null ? "text-white/45" : "text-accent-saffron"}>
                    [{hovered !== null ? "tracking" : "locked"}]
                  </span>
                </dd>
              </dl>
            </div>
          </Reveal>
        </div>

        {/* sky window */}
        <div className="relative flex min-h-[40svh] flex-1 items-center justify-center lg:min-h-[22svh]">
          {live && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-full border border-white/12 bg-navy-950/45 py-2 pl-2 pr-4 backdrop-blur-md transition-all duration-700",
                interacted ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100",
              )}
              aria-hidden
            >
              <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-white/10">
                <Hand className="cosmos-hint-hand size-4 text-accent-saffron" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/75">
                <span className="[@media(hover:none)]:hidden">Drag to explore the sky</span>
                <span className="hidden [@media(hover:none)]:inline">Swipe sideways to explore</span>
              </span>
              <span className="cosmos-hint-track relative hidden h-px w-10 overflow-hidden rounded-full bg-white/15 sm:block" />
            </div>
          )}
        </div>

        {/* legend + card */}
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6">
            <p
              id="cosmos-legend-title"
              className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/45"
            >
              <Crosshair className="size-3.5 text-accent-saffron" aria-hidden />
              Achievements · pick a constellation
            </p>
            <ul
              aria-labelledby="cosmos-legend-title"
              className="cosmos-legend-scroll pointer-events-auto -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {ENTRIES.map((e, i) => {
                const isFocused = i === focused;
                const isActive = i === active;
                return (
                  <li key={e.def.name} className="w-[236px] shrink-0 snap-start lg:w-auto">
                    <button
                      type="button"
                      aria-pressed={isFocused}
                      aria-controls="cosmos-card"
                      onClick={() => select(i)}
                      onPointerEnter={(ev) => {
                        if (ev.pointerType === "mouse") preview(i);
                      }}
                      onPointerLeave={(ev) => {
                        if (ev.pointerType === "mouse") preview(null);
                      }}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-saffron focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
                        isFocused
                          ? "border-accent-saffron/45 bg-accent-saffron/[0.09]"
                          : isActive
                            ? "border-white/20 bg-white/[0.07]"
                            : "border-white/[0.07] bg-navy-950/40 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[10px] tabular-nums tracking-[0.12em]",
                          isFocused ? "text-accent-saffron" : "text-white/35",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <ConstellationGlyph
                        def={e.def}
                        tone={isFocused || isActive ? "gold" : "muted"}
                        stroke={3}
                        scale={1.6}
                        className="size-8 shrink-0 transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-mono text-[10px] uppercase tracking-[0.2em]",
                            isFocused ? "text-accent-saffron/90" : "text-white/45",
                          )}
                        >
                          {e.def.name}
                        </span>
                        <span className="block truncate text-[13.5px] font-semibold leading-snug text-white/90">
                          {e.achievement.title}
                          <span className="font-normal text-white/50"> · {e.achievement.event}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pointer-events-auto order-1 lg:order-2 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <CosmosCard
              entry={entry}
              index={active}
              total={ENTRIES.length}
              origin={active === ORIGIN}
              previewing={hovered !== null && hovered !== focused}
            />
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`${focusedEntry.def.name}: ${focusedEntry.achievement.title}, ${focusedEntry.achievement.event}.`}
      </p>
    </section>
  );
}
