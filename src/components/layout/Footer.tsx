"use client";

import { useRef } from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinks, profile, socials } from "@/data/site";
import SocialIcon from "@/components/shared/SocialIcons";
import { DotGrid, GeoStrip, QuarterCircle } from "@/components/shared/Decorators";
import Monogram from "./Monogram";
import { scrollToTarget } from "./scroll";
import "./layout.css";

const STRIP_COPIES = 12; // per half (even, so both halves match) — covers 2560px+ screens

/**
 * Dark navy-950 footer: hackvidia GeoStrip band → columns (identity, navigate,
 * elsewhere) → giant outlined "NUGRAHA" with a gradient spotlight that
 * follows the pointer → mono credits bar.
 */
export default function Footer() {
  const wordRef = useRef<HTMLDivElement>(null);

  const onWordMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wordRef.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.classList.add("is-lit");
  };
  const onWordLeave = () => wordRef.current?.classList.remove("is-lit");

  const backToTop = () => {
    scrollToTarget(0);
    const skipTarget = document.getElementById("top");
    if (skipTarget) {
      skipTarget.setAttribute("tabindex", "-1");
      skipTarget.focus({ preventScroll: true });
      skipTarget.addEventListener("blur", () => skipTarget.removeAttribute("tabindex"), { once: true });
    }
  };

  const linkSocials = socials.filter((s) => s.key !== "email");

  return (
    <footer data-nav-theme="dark" className="relative overflow-hidden bg-navy-950 text-white">
      {/* ---------- GeoStrip band ---------- */}
      <div aria-hidden className="relative overflow-hidden border-b border-white/[0.06] bg-navy-900">
        <div className="nk-marquee flex w-max">
          {Array.from({ length: STRIP_COPIES * 2 }, (_, i) => (
            <div key={i} className={cn("w-[250px] shrink-0", i % 2 === 1 && "-scale-x-100")}>
              <GeoStrip opacity={0.95} />
            </div>
          ))}
        </div>
      </div>

      {/* ---------- decor ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-12 bottom-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[420px] w-[620px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]">
          <DotGrid opacity={0.45} gap={18} radius={1.3} />
        </div>
        <QuarterCircle size={180} color="primary" rotate={90} className="absolute -right-px top-0 opacity-40" />
        <div className="absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
      </div>

      {/* ---------- columns ---------- */}
      <div className="relative mx-auto max-w-[1240px] px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-5">
            <a href="#top" className="group inline-flex items-center gap-3" aria-label={`${profile.short} — back to top`}>
              <Monogram tone="dark" className="h-10 w-10" />
              <span className="text-[19px] font-extrabold tracking-tight">{profile.short}</span>
            </a>
            <p className="mt-6 max-w-[34ch] text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-snug tracking-tight text-white">
              {profile.headline}
            </p>
            <p className="mt-4 font-mono text-[12px] leading-relaxed text-white/45">
              {profile.campus}
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="group/mail mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-white/85 transition-colors hover:text-accent-saffron"
            >
              {profile.email}
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/mail:rotate-45"
              />
            </a>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{"// navigate"}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group/nl inline-flex items-center gap-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    <span
                      aria-hidden
                      className="h-px w-0 bg-accent-saffron transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nl:w-4"
                    />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{"// elsewhere"}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {linkSocials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/sl inline-flex items-center gap-3 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition-colors group-hover/sl:border-accent-sky group-hover/sl:bg-accent-sky/20">
                      <SocialIcon name={s.key} className="h-4 w-4" />
                    </span>
                    {s.label}
                    <span className="font-mono text-[12px] text-white/35">{s.handle}</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start sm:col-span-2 lg:col-span-1 lg:col-start-12 lg:justify-end">
            <button
              type="button"
              onClick={backToTop}
              data-cursor-label="Top"
              aria-label="Back to top"
              className="group/top grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-white backdrop-blur-xl transition-[background-color,border-color,color] duration-300 hover:border-accent-saffron hover:bg-accent-saffron hover:text-navy-950"
            >
              <ArrowUp
                aria-hidden
                className="h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/top:-translate-y-1"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- giant wordmark ---------- */}
      <div
        ref={wordRef}
        aria-hidden
        onPointerMove={onWordMove}
        onPointerLeave={onWordLeave}
        className="nk-word-wrap relative mt-16 select-none overflow-hidden px-2 lg:mt-24"
      >
        <div className="grid place-items-center">
          <p className="nk-word-outline col-start-1 row-start-1 whitespace-nowrap text-[clamp(3rem,13.6vw,15.5rem)] font-extrabold leading-[0.82] tracking-[-0.055em]">
            NUGRAHA
          </p>
          <p className="nk-word-fill col-start-1 row-start-1 whitespace-nowrap bg-linear-to-r from-accent-sky via-accent-cyan to-accent-saffron bg-clip-text text-[clamp(3rem,13.6vw,15.5rem)] font-extrabold leading-[0.82] tracking-[-0.055em] text-transparent">
            NUGRAHA
          </p>
        </div>
      </div>

      {/* ---------- credits ---------- */}
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-6 font-mono text-[11.5px] text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Designed &amp; built by Nugraha · Next.js · three.js · GSAP</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-saffron" aria-hidden />© 2026 {profile.short}
          </p>
        </div>
      </div>
    </footer>
  );
}
