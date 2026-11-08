"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { profile } from "@/data/site";
import { journey } from "@/data/portfolio";
import { asset } from "@/lib/asset";

/**
 * Portrait framed by a hackvidia-style tile mosaic.
 * Three depth layers (back tiles, photo, front tiles + campus chip) drift at
 * different speeds while the block scrolls through the viewport.
 * Geometry lives in a 100×100 viewBox so the whole puzzle scales fluidly.
 */
export default function PortraitMosaic() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const backY = useTransform(p, [0, 1], [28, -28]);
  const frontY = useTransform(p, [0, 1], [-36, 36]);
  const chipY = useTransform(p, [0, 1], [56, -56]);
  const photoY = useTransform(p, [0, 1], [10, -10]);
  const spin = useTransform(p, [0, 1], [-40, 40]);

  const uiLogo = journey.find((s) => s.name === "University")?.logo;

  return (
    <div ref={ref} className="group/portrait relative mx-auto aspect-square w-full max-w-[540px]">
      {/* ---------- back layer: tiles peeking out of the rounded photo corners ---------- */}
      <motion.div aria-hidden className="absolute inset-0" style={reduce ? undefined : { y: backY }}>
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          {/* top-left: royal square behind the photo's big rounded corner */}
          <rect x="1" y="1" width="31" height="31" className="fill-primary" />
          <path d="M1 32 V20 A12 12 0 0 1 13 32 Z" className="fill-accent-saffron" />
          {/* bottom-right: saffron quarter disc */}
          <path d="M99 99 H65 A34 34 0 0 1 99 65 Z" className="fill-accent-saffron" />
          <rect x="87" y="54" width="12" height="11" className="fill-accent-coral" />
          {/* dot matrix, top-right */}
          <g className="fill-primary/40">
            {Array.from({ length: 25 }, (_, i) => (
              <circle key={i} cx={74 + (i % 5) * 5.4} cy={3 + Math.floor(i / 5) * 5.4} r="0.9" />
            ))}
          </g>
        </svg>
      </motion.div>

      {/* ---------- photo ---------- */}
      <motion.div
        className="absolute left-[9%] top-[9%] h-[82%] w-[82%]"
        style={reduce ? undefined : { y: photoY }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-tl-[34%] rounded-br-[34%] rounded-tr-[20px] rounded-bl-[20px] bg-primary-soft shadow-[0_30px_70px_-30px_rgba(11,16,45,0.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized */}
          <img
            src={asset(profile.photo)}
            alt={`${profile.name} standing in front of the Faculty of Computer Science building, Universitas Indonesia`}
            width={1080}
            height={1080}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/portrait:scale-[1.045]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-900/45 via-transparent to-transparent"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
        </div>
      </motion.div>

      {/* ---------- front layer: tiles that overlap the frame ---------- */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={reduce ? undefined : { y: frontY }}>
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          {/* left edge stack */}
          <rect x="3" y="47" width="11" height="11" className="fill-accent-coral" />
          <path d="M3 58 H14 A11 11 0 0 1 3 69 Z" className="fill-accent-sky" />
          {/* top-right cluster */}
          <path d="M70 13 L81 2 V13 Z" className="fill-accent-saffron" />
          <rect x="81" y="2" width="11" height="11" className="fill-accent-sky" />
          <path d="M92 2 A11 11 0 0 1 92 13 Z" className="fill-primary" />
          {/* bottom edge */}
          <path d="M18 98 A9 9 0 0 1 36 98 Z" className="fill-primary-vivid" />
          <path d="M36 89 H45 V98 Z" className="fill-accent-coral" />
          {/* ring + sparkle */}
          <circle cx="95" cy="36" r="3.4" fill="none" strokeWidth="1.6" className="stroke-accent-coral" />
          <path
            d="M93 80 Q93 84 97 84 Q93 84 93 88 Q93 84 89 84 Q93 84 93 80 Z"
            className="fill-accent-saffron"
          />
        </svg>
      </motion.div>

      {/* rotating ring accent */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-[3%] bottom-[18%] h-[16%] w-[16%]"
        style={reduce ? undefined : { rotate: spin }}
      >
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <circle cx="20" cy="20" r="17" fill="none" strokeWidth="1.2" strokeDasharray="3 4" className="stroke-primary/50" />
          <circle cx="20" cy="3" r="2.4" className="fill-primary" />
        </svg>
      </motion.div>

      {/* ---------- campus chip ---------- */}
      <motion.div className="absolute bottom-[12%] left-[2%] sm:left-[-2%]" style={reduce ? undefined : { y: chipY }}>
        <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 py-2 pl-2 pr-4 shadow-[0_18px_40px_-18px_rgba(11,16,45,0.45)] backdrop-blur-md">
          {uiLogo ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export
            <img
              src={asset(uiLogo)}
              alt=""
              width={32}
              height={32}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain p-0.5"
            />
          ) : (
            <span aria-hidden className="h-8 w-8 shrink-0 rounded-tl-full bg-primary" />
          )}
          <span className="leading-tight">
            <span className="block text-[12px] font-semibold text-ink sm:text-[13px]">Computer Science</span>
            <span className="block text-[11.5px] text-ink-muted sm:text-[12px]">Universitas Indonesia</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
