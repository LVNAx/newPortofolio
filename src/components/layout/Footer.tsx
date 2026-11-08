"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowUpRight, Check, Copy, FileText, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { navLinks, profile, socials } from "@/data/site";
import SocialIcon from "@/components/shared/SocialIcons";
import { DotGrid, GeoStrip, QuarterCircle } from "@/components/shared/Decorators";
import Monogram from "./Monogram";
import { scrollToTarget } from "./scroll";
import "./layout.css";

const STRIP_COPIES = 12; // per half (even, so both halves match) — covers 2560px+ screens

const colHeading = "text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45";
const colLink =
  "inline-flex items-center gap-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white focus-visible:text-white";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Navy-950 footer: hackvidia GeoStrip band → brand block + three calm columns
 * (Navigate, Elsewhere, Contact) → bottom bar with copyright and the
 * "Part of Hypomonē" mark.
 */
export default function Footer() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const onCopy = async () => {
    const ok = await copyText(profile.email);
    if (!ok) {
      window.location.href = `mailto:${profile.email}`;
      return;
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const backToTop = () => {
    scrollToTarget(0);
    const skipTarget = document.getElementById("top");
    if (skipTarget) {
      skipTarget.setAttribute("tabindex", "-1");
      skipTarget.focus({ preventScroll: true });
      skipTarget.addEventListener("blur", () => skipTarget.removeAttribute("tabindex"), { once: true });
    }
  };

  const linkSocials = socials.filter((s) => s.key !== "email" && s.key !== "resume");
  const resume = socials.find((s) => s.key === "resume");

  return (
    <footer data-nav-theme="dark" className="relative overflow-hidden bg-navy-950 text-white">
      {/* ---------- GeoStrip band ---------- */}
      <div aria-hidden className="relative overflow-hidden border-b border-white/[0.06] bg-navy-900">
        <div className="nk-geo-marquee flex w-max">
          {Array.from({ length: STRIP_COPIES * 2 }, (_, i) => (
            <div key={i} className={cn("w-[250px] shrink-0", i % 2 === 1 && "-scale-x-100")}>
              <GeoStrip opacity={0.95} />
            </div>
          ))}
        </div>
      </div>

      {/* ---------- decor (kept quiet) ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-12 bottom-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[360px] w-[560px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]">
          <DotGrid opacity={0.3} gap={18} radius={1.2} />
        </div>
        <QuarterCircle size={150} color="primary" rotate={90} className="absolute -right-px top-0 opacity-25" />
        <div className="absolute -left-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* ---------- main ---------- */}
      <div className="relative mx-auto max-w-[1240px] px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <a href="#top" className="group inline-flex items-center gap-3" aria-label={`${profile.short}, back to top`}>
              <Monogram tone="dark" className="h-10 w-10" />
              <span className="text-[19px] font-extrabold tracking-tight">{profile.short}</span>
            </a>
            <p className="mt-6 max-w-[32ch] text-[17px] font-semibold leading-snug text-white/90">
              {profile.headline}
            </p>
            <p className="mt-3 text-[14px] text-white/50">{profile.campus}</p>
          </div>

          {/* navigate */}
          <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-6">
            <p className={colHeading}>Navigate</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={colLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* elsewhere */}
          <div className="lg:col-span-2">
            <p className={colHeading}>Elsewhere</p>
            <ul className="mt-5 flex flex-col gap-3">
              {linkSocials.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn(colLink, "group/sl gap-3")}>
                    <SocialIcon name={s.key} className="h-4 w-4 shrink-0 text-white/50 transition-colors group-hover/sl:text-accent-sky" />
                    <span className="flex flex-col leading-tight">
                      {s.label}
                      <span className="mt-0.5 text-[12.5px] font-normal text-white/40">{s.handle}</span>
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="sm:col-span-2 lg:col-span-3 lg:col-start-10">
            <p className={colHeading}>Contact</p>
            <ul className="mt-5 flex flex-col gap-4">
              <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="group/mail inline-flex items-center gap-1.5 break-all text-[15px] font-semibold text-white transition-colors hover:text-accent-saffron"
                >
                  {profile.email}
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/mail:rotate-45"
                  />
                </a>
                <button
                  type="button"
                  onClick={onCopy}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors",
                    copied
                      ? "border-state-success/40 bg-state-success/15 text-white"
                      : "border-white/15 text-white/60 hover:border-white/30 hover:text-white",
                  )}
                >
                  {copied ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <span role="status" aria-live="polite" className="sr-only">
                  {copied ? "Email address copied to clipboard" : ""}
                </span>
              </li>
              <li className="flex items-start gap-2 text-[14px] leading-relaxed text-white/55">
                <MapPin aria-hidden className="mt-[3px] h-4 w-4 shrink-0 text-white/40" />
                {profile.location}
              </li>
              {resume && (
                <li>
                  <a href={resume.href} target="_blank" rel="noopener noreferrer" className={cn(colLink, "group/cv")}>
                    <FileText aria-hidden className="h-4 w-4 shrink-0 text-white/50 transition-colors group-hover/cv:text-accent-sky" />
                    Resume
                    <span className="text-[12.5px] font-normal text-white/40">{resume.handle}</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- bottom bar ---------- */}
      <div className="relative border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 {profile.short}. All rights reserved.</p>
          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <p className="inline-flex items-center gap-2 font-medium text-white/65">
              <Monogram tone="dark" className="h-4 w-4" />
              Part of Hypomonē
            </p>
            <button
              type="button"
              onClick={backToTop}
              data-cursor-label="Top"
              className="group/top inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] pl-3.5 pr-1.5 text-[13px] font-medium text-white/80 transition-[background-color,border-color,color] duration-300 hover:border-accent-saffron hover:bg-accent-saffron hover:text-navy-950"
            >
              Back to top
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 transition-colors group-hover/top:bg-navy-950/10">
                <ArrowUp
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/top:-translate-y-0.5"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
