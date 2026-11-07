import type { CSSProperties, ReactNode } from "react";
import { DotGrid, GhostTiles, QuarterCircle } from "@/components/shared/Decorators";
import Reveal from "@/components/shared/Reveal";
import { achievements, projects } from "@/data/portfolio";
import { SECTION_IDS } from "@/data/site";
import ActsWord from "./ActsWord";
import AgentLoop from "./AgentLoop";
import CodeTerminal from "./CodeTerminal";
import NeuralField from "./NeuralField";
import OpenProjectButton from "./OpenProjectButton";
import SkillCards from "./SkillCards";
import TechMarquee from "./TechMarquee";
import "./ailab.css";

const readout: [string, string][] = [
  ["agents", "WASKITA · FoundrOS"],
  ["vision", "DINOv2 · SigLIP"],
  ["tabular", "LightGBM · TabPFN"],
  ["control", "MaskablePPO · CP-SAT"],
];

const fade = (stops: string): CSSProperties => ({
  WebkitMaskImage: `linear-gradient(to bottom, ${stops})`,
  maskImage: `linear-gradient(to bottom, ${stops})`,
});

function FigLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-white/45 sm:text-[12px]">
      <span className="text-accent-cyan">[ fig.{n} ]</span> {children}
    </p>
  );
}

export default function AiLab() {
  const bdc = projects.find((p) => p.slug === "bdc-waste");
  const bdcRank = achievements.find((a) => a.event.startsWith("Big Data Challenge"));

  return (
    <section
      id={SECTION_IDS.aiLab}
      data-nav-theme="dark"
      aria-labelledby="ailab-title"
      className="relative isolate overflow-x-clip bg-navy-900 text-white"
    >
      <TechMarquee />

      {/* ---------- background ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-24 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]" />
        <div className="absolute -right-40 top-[45%] h-[520px] w-[520px] rounded-full bg-accent-cyan/10 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 h-[520px] w-[620px] rounded-full bg-accent-sky/10 blur-[130px]" />
        <div className="absolute inset-0" style={fade("transparent, #000 12%, #000 75%, transparent")}>
          <DotGrid opacity={0.45} gap={24} radius={1.1} />
        </div>
        <NeuralField
          className="absolute inset-x-0 top-0 h-[1150px] w-full"
          style={fade("transparent 4%, #000 18%, #000 60%, transparent 100%")}
        />
        <GhostTiles opacity={0.045} className="absolute -right-24 top-40 h-auto w-[360px] sm:w-[560px]" />
        <GhostTiles opacity={0.035} className="absolute -left-40 bottom-10 h-auto w-[420px] rotate-180 sm:w-[640px]" />
        <QuarterCircle size={180} color="primary" rotate={180} className="absolute bottom-0 right-0 opacity-60" />
        <QuarterCircle
          size={90}
          color="sky"
          rotate={180}
          className="absolute bottom-0 right-[180px] hidden opacity-40 sm:block"
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-40 lg:pt-24">
        {/* ---------- header ---------- */}
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-accent-cyan sm:text-[13px]">
              {"// 02 — AI Lab"}
            </p>
            <h2
              id="ailab-title"
              className="mt-5 text-[46px] font-extrabold leading-[1.02] tracking-tight sm:text-[68px] lg:text-[84px] xl:text-[92px]"
            >
              I build AI
              <br /> that <ActsWord />.
              <span
                aria-hidden
                className="nk-caret ml-2 inline-block h-[0.72em] w-[0.1em] bg-accent-cyan align-baseline"
              />
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-3">
            <p className="text-[17px] leading-[1.65] text-white/70 sm:text-[19px]">
              Agents that perceive, decide and execute real actions. Models validated down to the last decimal. And the
              product surfaces that put both in people&apos;s hands.
            </p>
            <dl className="mt-7 grid grid-cols-1 gap-x-6 gap-y-2 font-mono text-[12.5px] sm:grid-cols-2">
              {readout.map(([k, v]) => (
                <div key={k} className="flex gap-3 border-t border-white/10 pt-2">
                  <dt className="w-[4.5rem] shrink-0 text-white/40">
                    <span className="text-accent-cyan">›</span> {k}
                  </dt>
                  <dd className="text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ---------- 1 · agent loop ---------- */}
        <div className="mt-20 lg:mt-28">
          <Reveal className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <FigLabel n="01">the agent loop</FigLabel>
              <h3 className="mt-3 text-[28px] font-bold leading-tight tracking-tight sm:text-[36px]">
                Two real systems. <span className="text-white/45">One loop.</span>
              </h3>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              Switch case studies and watch every stage of the loop map onto a real pipeline step. Click a node to jump to it.
            </p>
          </Reveal>
          <Reveal y={40}>
            <AgentLoop />
          </Reveal>
        </div>

        {/* ---------- 2 · vision notebook ---------- */}
        {bdc && (
          <div className="mt-24 grid grid-cols-1 items-center gap-10 lg:mt-32 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <FigLabel n="02">vision · frozen foundation models</FigLabel>
              <h3 className="mt-4 text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[38px]">{bdc.tagline}</h3>
              <p className="mt-5 text-[16px] leading-[1.7] text-white/65">{bdc.description}</p>
              <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-5">
                {bdc.metric && (
                  <div>
                    <p className="bg-linear-to-r from-accent-sky to-accent-cyan bg-clip-text text-[56px] font-extrabold leading-none tracking-tight text-transparent sm:text-[64px]">
                      {bdc.metric.value}
                    </p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
                      {bdc.metric.label}
                    </p>
                  </div>
                )}
                {bdcRank && (
                  <div className="pb-1">
                    <p className="text-[26px] font-bold leading-none">{bdcRank.title}</p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
                      {bdcRank.level}
                      {bdcRank.year ? ` · ${bdcRank.year}` : ""}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-6 font-mono text-[11.5px] text-white/40">{bdc.context}</p>
              <OpenProjectButton slug={bdc.slug} className="mt-7" />
            </Reveal>
            <Reveal delay={0.1} y={40} className="min-w-0 lg:col-span-7">
              <CodeTerminal />
            </Reveal>
          </div>
        )}

        {/* ---------- 3 · toolkit ---------- */}
        <div className="mt-24 lg:mt-32">
          <Reveal className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <FigLabel n="03">toolkit</FigLabel>
              <h3 className="mt-3 text-[28px] font-bold leading-tight tracking-tight sm:text-[36px]">
                The stack behind the <span className="text-accent-cyan">agents</span>.
              </h3>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-white/55">
              From foundation-model embeddings to the interface people actually touch.
            </p>
          </Reveal>
          <SkillCards />
        </div>
      </div>
    </section>
  );
}
