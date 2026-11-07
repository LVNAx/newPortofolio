"use client";

import clsx from "clsx";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { agentCases, LOOP_NODES } from "./agentCases";
import OpenProjectButton from "./OpenProjectButton";
import "./ailab.css";

/* ---------- geometry (SVG user units) ---------- */
const W = 560;
const H = 430;
const CX = 280;
const CY = 225;
const R = 140;
const NR = 30;
const STEP_MS = 3200;

const rad = (deg: number) => (deg * Math.PI) / 180;
const nodeAngle = (i: number) => -90 + i * (360 / LOOP_NODES.length);
const q = (v: number) => Math.round(v * 100) / 100;
const polar = (deg: number, r: number) => ({ x: q(CX + r * Math.cos(rad(deg))), y: q(CY + r * Math.sin(rad(deg))) });
const f = (n: number) => n.toFixed(2);

const NODES = LOOP_NODES.map((name, i) => {
  const a = nodeAngle(i);
  const { x, y } = polar(a, R);
  const c = Math.cos(rad(a));
  const side = Math.abs(c) > 0.3;
  const sign = c > 0 ? 1 : -1;
  return {
    name,
    a,
    x,
    y,
    anchor: (side ? (sign > 0 ? "start" : "end") : "middle") as "start" | "end" | "middle",
    lx: side ? x + sign * (NR + 14) : x,
    nameY: side ? y - 2 : y - NR - 24,
    tagY: side ? y + 16 : y - NR - 8,
  };
});

/** Arc from node i to node i+1 along the loop circle, trimmed to the node rims. */
const EDGES = NODES.map((n, i) => {
  const trim = ((NR + 9) / R) * (180 / Math.PI);
  const s = polar(n.a + trim, R);
  const e = polar(nodeAngle(i + 1) - trim, R);
  return `M${f(s.x)} ${f(s.y)} A${R} ${R} 0 0 1 ${f(e.x)} ${f(e.y)}`;
});

export default function AgentLoop() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const elapsed = useRef(0);

  const reduce = useReducedMotion();
  const inView = useInView(cardRef, { amount: 0.25 });
  const [caseIdx, setCaseIdx] = useState(0);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const current = agentCases[caseIdx];
  const accent = current.accent;
  const running = inView && !reduce && !hover && !userPaused;

  /* rAF-driven step timer: progress bar and node advance stay in sync, pause-safe */
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      if (elapsed.current >= STEP_MS) {
        elapsed.current = 0;
        setActive((a) => (a + 1) % LOOP_NODES.length);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, elapsed.current / STEP_MS)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  /* SMIL particles: freeze while off-screen */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  const select = useCallback((i: number) => {
    elapsed.current = 0;
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
    setActive(i);
  }, []);

  const switchCase = (i: number) => {
    if (i === caseIdx) return;
    elapsed.current = 0;
    setCaseIdx(i);
    setActive(0);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (caseIdx + (e.key === "ArrowRight" ? 1 : -1) + agentCases.length) % agentCases.length;
    switchCase(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  const statusLabel = reduce ? "static" : userPaused ? "paused" : hover ? "holding" : "live";

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_40px_120px_-40px_rgba(5,8,26,0.9)] backdrop-blur-xl lg:rounded-[32px]"
    >
      {/* accent glow follows the selected case */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl transition-colors duration-700"
        style={{ background: accent }}
      />

      {/* ---------- window bar ---------- */}
      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <p className="truncate font-mono text-[11.5px] tracking-[0.04em] text-white/50 sm:text-[12.5px]">
          <span className="text-white/30">fig.01 — </span>agent_loop.run(
          <span style={{ color: accent }}>&quot;{current.slug}&quot;</span>)
        </p>
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          disabled={!!reduce}
          aria-pressed={userPaused}
          aria-label={userPaused ? "Resume the loop animation" : "Pause the loop animation"}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:opacity-60"
        >
          <span className="relative flex h-2 w-2">
            {statusLabel === "live" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
            )}
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: statusLabel === "live" ? accent : "rgba(255,255,255,0.35)" }}
            />
          </span>
          {statusLabel}
          {!reduce && (userPaused ? <Play className="h-3 w-3" aria-hidden /> : <Pause className="h-3 w-3" aria-hidden />)}
        </button>
      </div>

      <div className="relative grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-10 lg:p-10">
        {/* ---------- loop diagram ---------- */}
        <div className="lg:col-span-7">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Agent loop for ${current.label}: ${LOOP_NODES.map((n, i) => `${n} — ${current.steps[i].tag}`).join(", ")}.`}
            className="h-auto w-full overflow-visible"
          >
            <defs>
              <radialGradient id={`${uid}-hub`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
                <stop offset="70%" stopColor={accent} stopOpacity="0.04" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
              <filter id={`${uid}-glow`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
              <marker
                id={`${uid}-arrow`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M1 1 L7 5 L1 9" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round" />
              </marker>
              <marker
                id={`${uid}-arrow-on`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M1 1 L7 5 L1 9" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
              </marker>
            </defs>

            {/* orbit guide */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />

            {/* hub */}
            <circle cx={CX} cy={CY} r={112} fill={`url(#${uid}-hub)`} />
            <circle
              cx={CX}
              cy={CY}
              r={96}
              fill="none"
              stroke={accent}
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeDasharray="1 7"
              strokeLinecap="round"
              className="nk-spin"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
            <circle
              cx={CX}
              cy={CY}
              r={70}
              fill="rgba(5,8,26,0.65)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
            <circle
              cx={CX}
              cy={CY}
              r={60}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="22 10"
              className="nk-spin-rev"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />

            {/* spokes */}
            {NODES.map((n, i) => {
              const a = polar(n.a, 76);
              const b = polar(n.a, R - NR - 6);
              const on = i === active;
              return (
                <line
                  key={`spoke-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={on ? accent : "rgba(255,255,255,0.12)"}
                  strokeOpacity={on ? 0.8 : 1}
                  strokeWidth={on ? 1.4 : 1}
                  strokeDasharray="2 5"
                  style={{ transition: "stroke 0.4s" }}
                />
              );
            })}

            {/* edges */}
            {EDGES.map((d, i) => {
              const on = i === active;
              return (
                <path
                  key={`edge-${i}`}
                  d={d}
                  fill="none"
                  stroke={on ? accent : "rgba(255,255,255,0.18)"}
                  strokeWidth={on ? 2.2 : 1.4}
                  markerEnd={`url(#${uid}-${on ? "arrow-on" : "arrow"})`}
                  style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
                />
              );
            })}

            {/* particles */}
            {!reduce &&
              EDGES.map((d, i) =>
                [0, 1, 2].map((k) => {
                  const on = i === active;
                  return (
                    <g key={`p-${i}-${k}`}>
                      <circle r={on ? 5 : 3.5} fill={on ? accent : "#a9c6ff"} opacity={on ? 0.55 : 0.25} filter={`url(#${uid}-glow)`}>
                        <animateMotion dur="2.4s" begin={`${-k * 0.8}s`} repeatCount="indefinite" path={d} />
                      </circle>
                      <circle r={on ? 2.4 : 1.6} fill={on ? "#ffffff" : "#a9c6ff"} opacity={on ? 1 : 0.6}>
                        <animateMotion dur="2.4s" begin={`${-k * 0.8}s`} repeatCount="indefinite" path={d} />
                      </circle>
                    </g>
                  );
                }),
              )}

            {/* nodes */}
            {NODES.map((n, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <g
                  key={`node-${i}`}
                  onClick={() => select(i)}
                  className="cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <circle cx={n.x} cy={n.y} r={NR + 16} fill="transparent" />
                  {on && !reduce && (
                    <circle cx={n.x} cy={n.y} r={NR + 4} fill="none" stroke={accent} strokeWidth="1.5" className="nk-halo" />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={NR}
                    fill={on ? accent : "#0f1638"}
                    fillOpacity={on ? 0.16 : 1}
                    stroke={on ? accent : done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)"}
                    strokeWidth={on ? 2 : 1.2}
                    style={{ transition: "fill 0.4s, stroke 0.4s" }}
                  />
                  <circle cx={n.x} cy={n.y} r={NR - 7} fill="none" stroke="rgba(255,255,255,0.06)" />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    className="font-mono text-[15px] font-bold"
                    fill={on ? accent : "rgba(255,255,255,0.6)"}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </text>
                  <text
                    x={n.lx}
                    y={n.nameY}
                    textAnchor={n.anchor}
                    className="font-mono text-[20px] font-bold uppercase tracking-[0.08em] sm:text-[14px]"
                    fill={on ? "#ffffff" : "rgba(255,255,255,0.72)"}
                  >
                    {n.name}
                  </text>
                  <text
                    x={n.lx}
                    y={n.tagY}
                    textAnchor={n.anchor}
                    className="hidden font-mono text-[12px] sm:inline"
                    fill={on ? accent : "rgba(255,255,255,0.42)"}
                  >
                    {current.steps[i].tag}
                  </text>
                </g>
              );
            })}

            {/* hub readout */}
            <g key={`${caseIdx}-${active}`} className="nk-fade-up">
              <text
                x={CX}
                y={CY - 24}
                textAnchor="middle"
                className="font-mono text-[13px] sm:text-[11px]"
                fill="rgba(255,255,255,0.45)"
              >
                agent://{current.slug}
              </text>
              <text x={CX} y={CY + 18} textAnchor="middle" className="font-sans text-[44px] font-extrabold" fill={accent}>
                {String(active + 1).padStart(2, "0")}
              </text>
              <text
                x={CX}
                y={CY + 40}
                textAnchor="middle"
                className="font-mono text-[13px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                fill="#ffffff"
              >
                {LOOP_NODES[active]}
              </text>
            </g>
          </svg>
        </div>

        {/* ---------- case panel ---------- */}
        <div className="flex flex-col lg:col-span-5">
          <div
            role="tablist"
            aria-label="Choose a case study"
            className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1"
          >
            {agentCases.map((c, i) => {
              const on = i === caseIdx;
              return (
                <button
                  key={c.slug}
                  id={`${uid}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => switchCase(i)}
                  onKeyDown={onTabKey}
                  className={clsx(
                    "relative rounded-full px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan sm:text-[13px]",
                    on ? "text-navy-950" : "text-white/60 hover:text-white",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId={`${uid}-pill`}
                      className="absolute inset-0 rounded-full"
                      style={{ background: c.accent }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${caseIdx}`} className="mt-6 flex flex-1 flex-col">
            {/* header — both cases stacked in one grid cell so height never jumps */}
            <div className="grid">
              {agentCases.map((c, i) => (
                <div
                  key={c.slug}
                  aria-hidden={i !== caseIdx}
                  className={clsx(
                    "[grid-area:1/1] transition-all duration-500",
                    i === caseIdx ? "translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0",
                  )}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{c.project.context}</p>
                  <h3 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-[30px]">
                    {c.project.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65">{c.project.tagline}</p>
                </div>
              ))}
            </div>

            {/* steps */}
            <ol
              className="mt-6 border-t border-white/10"
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
            >
              {LOOP_NODES.map((node, i) => {
                const on = i === active;
                return (
                  <li key={node} className="relative border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={on ? "step" : undefined}
                      className="group/step flex w-full items-center gap-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cyan"
                    >
                      <span
                        className="w-6 font-mono text-[11px] transition-colors"
                        style={{ color: on ? accent : "rgba(255,255,255,0.35)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={clsx(
                          "font-mono text-[13px] font-bold uppercase tracking-[0.12em] transition-colors",
                          on ? "text-white" : "text-white/55 group-hover/step:text-white/85",
                        )}
                      >
                        {node}
                      </span>
                      <span
                        className="ml-auto truncate pl-3 font-mono text-[11.5px] transition-colors"
                        style={{ color: on ? accent : "rgba(255,255,255,0.38)" }}
                      >
                        {current.steps[i].tag}
                      </span>
                    </button>
                    {on && (
                      <span
                        ref={barRef}
                        aria-hidden
                        className="absolute -bottom-px left-0 h-px w-full origin-left"
                        style={{ background: accent, transform: reduce ? "scaleX(1)" : "scaleX(0)" }}
                      />
                    )}
                  </li>
                );
              })}
            </ol>

            {/* caption — every caption stacked so the box keeps the tallest height */}
            <div className="mt-5 grid">
              {agentCases.map((c, ci) =>
                c.steps.map((s, si) => {
                  const on = ci === caseIdx && si === active;
                  return (
                    <div
                      key={`${c.slug}-${si}`}
                      aria-hidden={!on}
                      className={clsx(
                        "[grid-area:1/1] border-l-2 pl-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        on ? "translate-x-0 opacity-100" : "pointer-events-none invisible -translate-x-2 opacity-0",
                      )}
                      style={{ borderColor: c.accent }}
                    >
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: c.accent }}>
                        &gt; {LOOP_NODES[si].toLowerCase()}()
                      </p>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/80 sm:text-[15px]">{s.caption}</p>
                    </div>
                  );
                }),
              )}
            </div>

            {/* metric + CTA */}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 pt-2 lg:mt-auto">
              {current.project.metric && (
                <div>
                  <p className="text-[40px] font-extrabold leading-none tracking-tight" style={{ color: accent }}>
                    {current.project.metric.value}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
                    {current.project.metric.label}
                  </p>
                </div>
              )}
              <OpenProjectButton slug={current.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
