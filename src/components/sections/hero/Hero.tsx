"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import clsx from "clsx";
import { profile, socials } from "@/data/site";
import { projectCategories, projects } from "@/data/portfolio";
import { asset } from "@/lib/asset";
import SocialIcon from "@/components/shared/SocialIcons";
import { GhostTiles, LeafCorner, TileCluster } from "@/components/shared/Decorators";
import RoleTyper from "./RoleTyper";
import StaticCore from "./StaticCore";
import { useReducedMotion } from "./useReducedMotion";
import type { AtlasCard, HeroSceneController } from "./orbit/scene";
import "./hero.css";

type LenisLike = { stop(): void; start(): void; scrollTo(t: string | number | HTMLElement, o?: object): void };
const getLenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

const categoryLabel = (key: string) => projectCategories.find((c) => c.key === key)?.label ?? key;

/** Smooth-scroll to #projects, then ask the Projects section to open a case study. */
function openProject(slug: string, reduced: boolean) {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: { slug } }));
  };
  const el = document.getElementById("projects");
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo("#projects", { onComplete: fire, immediate: reduced });
    window.setTimeout(fire, 1800);
  } else if (el) {
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.addEventListener("scrollend", fire, { once: true });
    window.setTimeout(fire, reduced ? 50 : 1200);
  } else {
    fire();
  }
}

export default function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<HeroSceneController | null>(null);
  const pointer = useRef({ down: false, x: 0, y: 0, moved: 0 });

  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [hover, setHover] = useState<number | null>(null);

  const sceneOn = !reduced && status === "ready";

  const cards = useMemo<AtlasCard[]>(
    () =>
      projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        category: categoryLabel(p.category),
        year: p.year,
        accent: p.accent,
        context: p.context,
        metric: p.metric,
        image: p.image,
      })),
    [],
  );

  /* ---------- lazy-load three.js after first paint ---------- */
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas || cards.length === 0) return;
    let disposed = false;
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        import("./orbit/scene")
          .then(({ createHeroScene }) =>
            createHeroScene({
              canvas,
              cards,
              resolve: asset,
              mobile,
              getAnchor: () => {
                const a = anchorRef.current?.getBoundingClientRect();
                const c = canvas.getBoundingClientRect();
                return a ? { x: a.left - c.left, y: a.top - c.top } : null;
              },
              onHover: setHover,
            }),
          )
          .then((ctrl) => {
            if (disposed) return ctrl.dispose();
            ctrlRef.current = ctrl;
            const s = sectionRef.current;
            if (s) {
              const rect = s.getBoundingClientRect();
              ctrl.setScroll(Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height))), window.scrollY);
            }
            setStatus("ready");
          })
          .catch(() => {
            if (!disposed) setStatus("failed");
          });
      }, 80);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      ctrlRef.current?.dispose();
      ctrlRef.current = null;
    };
  }, [reduced, cards]);

  /* ---------- scroll → extra rotation + wave + grid parallax ---------- */
  useEffect(() => {
    if (!sceneOn) return;
    const onScroll = () => {
      const s = sectionRef.current;
      if (!s) return;
      const rect = s.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      ctrlRef.current?.setScroll(progress, window.scrollY);
      if (rect.bottom < 80) setHover(null);
    };
    const onResize = () => ctrlRef.current?.relayout();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [sceneOn]);

  /* ---------- floating label that trails the cursor (BEM UI pattern) ---------- */
  useEffect(() => {
    if (hover === null) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let first = true;
    let raf = 0;
    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (first) {
        x = tx;
        y = ty;
        first = false;
      }
    };
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      if (labelRef.current) labelRef.current.style.transform = `translate3d(${x + 22}px, ${y + 18}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [hover]);

  /* ---------- drag to spin, click to open ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = { down: true, x: e.clientX, y: e.clientY, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p.down) return;
    const dx = e.clientX - p.x;
    p.moved += Math.abs(dx) + Math.abs(e.clientY - p.y);
    p.x = e.clientX;
    p.y = e.clientY;
    if (dx && p.moved > 4) ctrlRef.current?.drag(dx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p.down) return;
    p.down = false;
    ctrlRef.current?.release();
    if (p.moved > 6) return;
    const item = ctrlRef.current?.pick(e.clientX, e.clientY);
    if (item === null || item === undefined) return;
    setHover(null);
    openProject(projects[item].slug, reduced);
  };
  const onPointerCancel = () => {
    pointer.current.down = false;
    ctrlRef.current?.release();
  };

  const onExplore = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const lenis = getLenis();
      if (!lenis) return;
      e.preventDefault();
      lenis.scrollTo("#projects", { immediate: reduced });
    },
    [reduced],
  );

  const hovered = hover !== null ? projects[hover] : null;
  const rowSocials = socials.filter((s) => s.key !== "resume");

  return (
    <section
      id="top"
      ref={sectionRef}
      data-nav-theme="dark"
      aria-label="Introduction"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy-950 text-white"
    >
      {/* ---------- backdrop (also the static fallback) ---------- */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-navy-950 via-navy-950 to-navy-900" />

      {/* WebGL stage: neural core + project orbit + grid + star dust */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={clsx(
          "absolute inset-0 z-0 h-full w-full touch-pan-y select-none transition-opacity duration-1000",
          sceneOn ? "opacity-100" : "opacity-0",
          hover !== null && "cursor-pointer",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      />

      {/* Anchor: where the core sits. The scene reads this point, so the layout lives in CSS. */}
      <div
        ref={anchorRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(72px+min(19svh,170px))] z-0 h-0 w-0 sm:top-[calc(72px+min(22svh,210px))] lg:left-[67%] lg:top-1/2 xl:left-[65%]"
      >
        <div
          className={clsx(
            "absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000",
            sceneOn ? "opacity-0" : "opacity-100",
            !reduced && status === "loading" && "motion-safe:animate-pulse",
          )}
        >
          <StaticCore />
        </div>
      </div>

      {/* ---------- hackvidia decorators (low opacity on navy) ---------- */}
      <LeafCorner className="absolute left-0 top-[72px] z-[1] h-auto w-[120px] sm:w-[170px] lg:w-[210px]" opacity={0.2} />
      <GhostTiles className="absolute right-0 top-[72px] z-[1] hidden h-auto w-[340px] lg:block xl:w-[420px]" opacity={0.045} />
      <TileCluster className="absolute bottom-0 right-0 z-[1] h-auto w-[200px] -scale-x-100 sm:w-[280px] lg:w-[360px]" opacity={0.12} />

      {/* ---------- scrims keep the copy readable over the scene ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-linear-to-b from-navy-950/80 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_top,rgba(5,8,26,0.97)_0%,rgba(5,8,26,0.88)_38%,rgba(5,8,26,0.4)_52%,transparent_64%)] lg:bg-[radial-gradient(ellipse_62%_78%_at_14%_74%,rgba(5,8,26,0.94)_0%,rgba(5,8,26,0.72)_42%,rgba(5,8,26,0.2)_68%,transparent_80%)]"
      />

      {/* ---------- copy ---------- */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-12 pt-[calc(72px+min(36svh,330px))] sm:px-8 sm:pb-20 sm:pt-[calc(72px+min(42svh,420px))] lg:px-14 lg:pb-[clamp(96px,12vh,136px)] lg:pt-32">
        <div className="pointer-events-auto max-w-[680px]">
          <p
            className="hero-rise mb-3 flex items-center gap-3 text-[14px] font-semibold text-accent-cyan sm:mb-4 sm:text-[16px]"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Hi, I&apos;m
          </p>

          <h1 className="font-sans text-white">
            <span className="sr-only">{profile.short}</span>
            <span aria-hidden className="block text-[clamp(64px,10.5vw,176px)] font-extrabold leading-[0.9] tracking-[-0.045em]">
              <span className="hero-mask">
                {profile.firstName.split("").map((ch, i) => (
                  <span key={i} className="hero-letter" style={{ "--d": `${220 + i * 55}ms` } as React.CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
              <span className="hero-rise inline-block" style={{ "--d": "720ms" } as React.CSSProperties}>
                <span className="hero-node" />
              </span>
            </span>
          </h1>

          <p
            className="hero-rise mt-5 whitespace-nowrap text-[clamp(20px,2.3vw,34px)] font-bold leading-tight tracking-[-0.02em] text-white sm:mt-7"
            style={{ "--d": "780ms" } as React.CSSProperties}
          >
            I build <RoleTyper words={profile.roles} reduced={reduced} />
          </p>

          <p
            className="hero-rise mt-3 max-w-[540px] text-[15px] leading-relaxed text-white/65 sm:mt-4 sm:text-[17px] lg:text-[18px]"
            style={{ "--d": "880ms" } as React.CSSProperties}
          >
            {profile.headline}
          </p>

          <div className="hero-rise mt-7 flex flex-wrap items-center gap-2.5 sm:mt-9 sm:gap-3" style={{ "--d": "980ms" } as React.CSSProperties}>
            <a
              href="#projects"
              onClick={onExplore}
              className="hero-cta group inline-flex h-12 items-center gap-2 rounded-full bg-linear-to-r from-accent-sky to-primary-vivid px-5 text-[14px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(79,139,255,0.85)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(94,230,255,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 sm:h-[52px] sm:px-7 sm:text-[15px]"
            >
              Explore my AI work
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.25} />
            </a>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-[14px] font-semibold text-white backdrop-blur-xl transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 sm:h-[52px] sm:px-6 sm:text-[15px]"
            >
              <Download className="hidden h-4 w-4 text-accent-cyan transition-transform duration-300 group-hover:translate-y-0.5 sm:block" strokeWidth={2.25} />
              Download CV
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>

          <ul className="hero-rise mt-7 hidden items-center gap-2 sm:flex" style={{ "--d": "1080ms" } as React.CSSProperties}>
            {rowSocials.map((s) => {
              const external = /^https?:\/\//.test(s.href);
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={`${s.label} — ${s.handle}`}
                    title={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-[color,border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:text-accent-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                  >
                    <SocialIcon name={s.key} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              );
            })}
            <li aria-hidden className="ml-3 mr-1 hidden h-5 w-px bg-white/15 md:block" />
            <li className="hidden text-[13px] font-medium text-white/50 md:block">{profile.campus}</li>
          </ul>
        </div>
      </div>

      {/* ---------- keyboard / screen-reader access to the orbit ---------- */}
      <nav
        aria-label="Projects in orbit"
        className="sr-only z-30 focus-within:not-sr-only focus-within:absolute focus-within:left-5 focus-within:top-24 focus-within:max-h-[60svh] focus-within:w-72 focus-within:overflow-y-auto focus-within:rounded-2xl focus-within:border focus-within:border-white/10 focus-within:bg-navy-900/90 focus-within:p-4 focus-within:backdrop-blur-xl"
      >
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-cyan">Projects</p>
        <ul className="space-y-1">
          {projects.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => openProject(p.slug, reduced)}
                className="w-full rounded-md px-2 py-1 text-left text-[14px] text-white/85 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- scroll cue ---------- */}
      <a
        href="#about"
        aria-label="Scroll to about"
        className="hero-rise absolute bottom-8 right-8 z-10 hidden items-center gap-3 rounded-full text-[12px] font-medium text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan sm:flex lg:bottom-10 lg:right-14"
        style={{ "--d": "1300ms" } as React.CSSProperties}
      >
        Scroll
        <span className="hero-scroll-line block h-10 w-px bg-white/20" />
      </a>

      {/* ---------- floating label over a hovered card ---------- */}
      <div
        ref={labelRef}
        aria-hidden
        className={clsx(
          "hero-label pointer-events-none fixed left-0 top-0 z-[60] flex items-center gap-3 rounded-full border border-white/15 bg-navy-900/80 py-2 pl-4 pr-2 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl [@media(hover:none)]:hidden",
          hovered ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-cyan">{hovered ? categoryLabel(hovered.category) : ""}</span>
          <span className="text-[14px] font-semibold">{hovered?.title}</span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan text-navy-950">
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
    </section>
  );
}
