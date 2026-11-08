"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinks, profile, socials } from "@/data/site";
import SocialIcon from "@/components/shared/SocialIcons";
import { DotGrid, GhostTiles, QuarterCircle } from "@/components/shared/Decorators";
import Monogram from "./Monogram";
import { getLenis, scrollToTarget, focusTarget } from "./scroll";
import "./layout.css";

type Theme = "dark" | "light";

const NAV_PROBE_Y = 36; // vertical centre of the 72px navbar band
const sectionIds = navLinks.map((l) => l.href.slice(1));

/**
 * Fixed glass navbar (BEM UI floating pill × hackvidia tiles).
 * - Dark/light glass follows the [data-nav-theme] section under the bar.
 * - Active section via IntersectionObserver + a sliding pill that also follows hover.
 * - Hides on scroll down, returns on scroll up; 2px scroll-progress line on top.
 * - < lg: hackvidia hamburger opens a full-screen navy menu (circular reveal).
 */
export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const openRef = useRef(false);
  const activeRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* ---------- scroll: progress, hide/show, theme probe ---------- */
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)) : 0})`;
      }
      setScrolled(y > 24);

      const dy = y - lastY;
      if (y < 120) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(dy) > 8) {
        if (!openRef.current) setHidden(dy > 0);
        lastY = y;
      }

      // Deepest [data-nav-theme] element crossing the navbar band wins.
      let next: Theme | null = null;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"))) {
        if (el.closest("[data-navbar]")) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= NAV_PROBE_Y && r.bottom > NAV_PROBE_Y) {
          next = el.dataset.navTheme === "light" ? "light" : "dark";
        }
      }
      if (next) setTheme(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ---------- active section ---------- */
  useEffect(() => {
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const current = sectionIds.filter((id) => visible.has(id)).pop() ?? null;
        setActive(current);
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );
    const observeAll = () => {
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
    };
    observeAll();
    // Sections loaded lazily may appear a little later.
    const t = window.setTimeout(observeAll, 1500);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  /* ---------- sliding pill ---------- */
  const movePill = useCallback((target: HTMLElement | null) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!target) {
      pill.style.opacity = "0";
      return;
    }
    const wasHidden = pill.style.opacity !== "1";
    if (wasHidden) pill.style.transition = "opacity 0.3s ease";
    pill.style.width = `${target.offsetWidth}px`;
    pill.style.transform = `translateX(${target.offsetLeft}px)`;
    pill.style.opacity = "1";
    if (wasHidden) {
      requestAnimationFrame(() => {
        pill.style.transition = "";
      });
    }
  }, []);

  const pillToActive = useCallback(() => {
    const id = activeRef.current;
    const el = id ? listRef.current?.querySelector<HTMLElement>(`[data-nav-id="${id}"]`) : null;
    movePill(el ?? null);
  }, [movePill]);

  useEffect(() => {
    activeRef.current = active;
    pillToActive();
  }, [active, pillToActive]);

  useEffect(() => {
    const onResize = () => pillToActive();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [pillToActive]);

  /* ---------- mobile menu: lock scroll, ESC, focus ---------- */
  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) burgerRef.current?.focus({ preventScroll: true });
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    const html = document.documentElement;
    const lenis = getLenis();
    if (lenis) lenis.stop();
    else html.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstMenuLinkRef.current?.focus({ preventScroll: true }), 350);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      if (lenis) lenis.start();
      else html.style.overflow = "";
    };
  }, [open]);

  const onMenuLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    // Wait for the menu to unlock scrolling, then glide.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (scrollToTarget(href)) {
          try {
            window.history.replaceState(window.history.state, "", href);
          } catch {
            /* ignore */
          }
          focusTarget(href);
        }
      }),
    );
  };

  const t: Theme = open ? "dark" : theme;
  const dark = t === "dark";

  return (
    <>
      {/* scroll progress — always visible, even while the bar is tucked away */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[62] h-[2px]">
        <div
          ref={progressRef}
          style={{ transform: "scaleX(0)" }}
          className="h-full w-full origin-left bg-linear-to-r from-accent-sky via-accent-cyan to-accent-saffron"
        />
      </div>

      <header
        data-navbar
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-[60] h-[72px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          hidden && !open ? "-translate-y-[110%]" : "translate-y-0",
        )}
      >
        <div className="mx-auto flex h-full max-w-[1240px] items-center px-3 sm:px-6 lg:px-8">
          <nav
            aria-label="Primary"
            className={cn(
              "relative flex h-14 w-full items-center justify-between gap-3 rounded-full border pl-4 pr-2 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow,color] duration-500 sm:pl-5",
              dark
                ? "border-white/10 text-white"
                : "border-white/90 text-ink shadow-[0_0_0_1px_rgba(11,16,45,0.05),0_20px_44px_-18px_rgba(11,16,45,0.25)]",
              dark && (scrolled || open)
                ? "bg-navy-900/60 shadow-[0_18px_44px_-20px_rgba(0,0,0,0.65)]"
                : dark
                  ? "bg-white/[0.04]"
                  : "bg-white/75",
            )}
          >
            {/* logo */}
            <a
              href="#top"
              aria-label={`${profile.short} — back to top`}
              data-scroll-manual={open || undefined}
              className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-1"
              onClick={(e) => {
                if (open) onMenuLink(e, "#top");
              }}
            >
              <Monogram tone={dark ? "dark" : "light"} className="h-7 w-7 sm:h-8 sm:w-8" />
              <span className="text-[15px] font-extrabold leading-none tracking-tight">{profile.short}</span>
            </a>

            {/* centre links (lg+) */}
            <ul
              ref={listRef}
              onMouseLeave={pillToActive}
              className="relative hidden items-center lg:flex"
            >
              <span
                ref={pillRef}
                aria-hidden
                style={{ opacity: 0, width: 0 }}
                className={cn(
                  "absolute left-0 top-1/2 h-9 -translate-y-1/2 rounded-full transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                  dark ? "bg-white/10 ring-1 ring-white/10" : "bg-navy-900/[0.06] ring-1 ring-navy-900/[0.06]",
                )}
              />
              {navLinks.map((link) => {
                const id = link.href.slice(1);
                const isActive = active === id;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      data-nav-id={id}
                      aria-current={isActive ? "location" : undefined}
                      onMouseEnter={(e) => movePill(e.currentTarget)}
                      onFocus={(e) => movePill(e.currentTarget)}
                      onBlur={pillToActive}
                      className={cn(
                        "relative z-10 block rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-300 xl:px-4",
                        dark
                          ? isActive
                            ? "text-white"
                            : "text-white/60 hover:text-white"
                          : isActive
                            ? "text-ink"
                            : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* right side */}
            <div className="flex items-center gap-2">
              <a
                href="#contact"
                className={cn(
                  "group hidden h-10 items-center gap-2 rounded-full pl-4 pr-1.5 text-[13.5px] font-bold transition-[background-color,color,box-shadow] duration-300 sm:inline-flex",
                  dark
                    ? "bg-white text-navy-900 hover:bg-accent-saffron"
                    : "bg-navy-900 text-white hover:bg-primary",
                )}
              >
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="nk-ping absolute inline-flex h-full w-full rounded-full bg-state-success" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-state-success" />
                </span>
                Let&apos;s talk
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45",
                    dark ? "bg-navy-900 text-white" : "bg-white text-navy-900",
                  )}
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </a>

              <div className="lg:hidden">
              <button
                ref={burgerRef}
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                  "hamburger overflow-hidden rounded-full",
                  open && "is-open",
                  dark ? "hover:bg-white/10" : "hover:bg-navy-900/5",
                )}
              >
                <span className="hamburger-icon" />
              </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ---------- full-screen mobile menu ---------- */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        data-lenis-prevent
        className={cn(
          "nk-menu fixed inset-0 z-[58] overflow-y-auto overscroll-contain bg-navy-950 text-white lg:hidden",
          open && "is-open",
        )}
      >
        {/* decor */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]">
            <DotGrid opacity={0.5} gap={18} radius={1.4} />
          </div>
          <GhostTiles className="absolute -right-24 top-16 h-auto w-[440px]" opacity={0.06} />
          <QuarterCircle
            size={220}
            color="primary"
            rotate={180}
            className="absolute -bottom-6 -left-6 opacity-60"
          />
          <QuarterCircle
            size={110}
            color="sky"
            rotate={180}
            className="absolute bottom-[214px] -left-1 opacity-40"
          />
          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-accent-sky/20 blur-[100px]" />
        </div>

        <div className="relative flex min-h-full flex-col px-6 pb-10 pt-[104px] sm:px-10">
          <p className="nk-menu-item font-mono text-[11px] uppercase tracking-[0.2em] text-white/45" style={{ ["--d" as string]: "80ms" }}>
            {"// navigate"}
          </p>

          <nav aria-label="Mobile" className="mt-5">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, i) => {
                const id = link.href.slice(1);
                const isActive = active === id;
                return (
                  <li key={link.href} className="nk-menu-item" style={{ ["--d" as string]: `${140 + i * 55}ms` }}>
                    <a
                      ref={i === 0 ? firstMenuLinkRef : undefined}
                      href={link.href}
                      data-scroll-manual
                      onClick={(e) => onMenuLink(e, link.href)}
                      aria-current={isActive ? "location" : undefined}
                      className="group flex items-baseline gap-4 border-b border-white/[0.07] py-3"
                    >
                      <span className={cn("w-7 font-mono text-[12px]", isActive ? "text-accent-saffron" : "text-white/35")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-[clamp(2.25rem,10.5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2",
                          isActive ? "text-accent-saffron" : "text-white group-hover:text-accent-sky",
                        )}
                      >
                        {link.label}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="ml-auto h-6 w-6 self-center text-white/30 transition-[transform,color] duration-500 group-hover:rotate-45 group-hover:text-white"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto pt-12">
            <div className="nk-menu-item flex items-center gap-2.5 font-mono text-[12px] text-white/60" style={{ ["--d" as string]: "520ms" }}>
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="nk-ping absolute inline-flex h-full w-full rounded-full bg-state-success" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-state-success" />
              </span>
              {profile.status}
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="nk-menu-item mt-3 inline-block text-[clamp(1.15rem,5.4vw,1.6rem)] font-bold tracking-tight text-white underline decoration-white/20 underline-offset-[6px] transition-colors hover:decoration-accent-saffron"
              style={{ ["--d" as string]: "570ms" }}
            >
              {profile.email}
            </a>
            <ul className="nk-menu-item mt-6 flex flex-wrap gap-2.5" style={{ ["--d" as string]: "620ms" }}>
              {socials
                .filter((s) => s.key !== "email")
                .map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in a new tab)`}
                      className="grid h-12 w-12 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-white/80 transition-colors hover:border-accent-sky hover:bg-accent-sky/15 hover:text-white"
                    >
                      <SocialIcon name={s.key} className="h-5 w-5" />
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
