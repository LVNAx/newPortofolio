import clsx from "clsx";
import { Highlight } from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { GhostTiles, GlyphMini, MoonCorner, MosaicRight, QuarterCircle } from "@/components/shared/Decorators";
import { profile, SECTION_IDS } from "@/data/site";
import { experiences, stats } from "@/data/portfolio";
import { asset } from "@/lib/asset";
import PortraitMosaic from "./PortraitMosaic";
import StatCounter from "./StatCounter";

const facts: { key: string; value: string; live?: boolean }[] = [
  { key: "campus", value: profile.campus },
  { key: "based_in", value: profile.location },
  { key: "status", value: profile.status, live: true },
];

const statTiles = [
  { color: "sky", rotate: 0, suffix: "text-accent-sky" },
  { color: "saffron", rotate: 90, suffix: "text-accent-saffron" },
  { color: "coral", rotate: 180, suffix: "text-accent-coral" },
  { color: "primary", rotate: 270, suffix: "text-primary" },
] as const;

export default function About() {
  return (
    <section
      id={SECTION_IDS.about}
      data-nav-theme="light"
      aria-labelledby="about-title"
      className="relative isolate overflow-x-clip bg-surface-alt pb-36 pt-24 sm:pt-28 lg:pb-48 lg:pt-36"
    >
      {/* ---------- decorators ---------- */}
      <MosaicRight
        opacity={0.95}
        className="absolute right-0 top-0 -z-10 hidden h-auto w-[230px] lg:block xl:w-[300px]"
      />
      <MoonCorner opacity={0.16} className="absolute right-0 top-0 -z-10 h-auto w-[150px] lg:hidden" />
      <MoonCorner opacity={0.12} className="absolute bottom-0 left-0 -z-10 hidden h-auto w-[260px] rotate-180 lg:block" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------- header ---------- */}
        <Reveal className="max-w-4xl">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-primary sm:text-[13px]">
            {"// 01 — About"}
          </p>
          <h2
            id="about-title"
            className="isolate mt-5 text-[40px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[56px] lg:text-[76px]"
          >
            Reading patterns
            <br className="hidden sm:block" /> out of{" "}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-[-0.06em] bottom-[0.06em] -z-10 h-[0.32em] -skew-x-6 rounded-[3px] bg-accent-saffron/80"
              />
              <Highlight>noise</Highlight>
            </span>
            .
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-ink-muted sm:text-[19px]">
            A builder who started with the stars and now ships models, agents and the products around them.
          </p>
        </Reveal>

        {/* ---------- body ---------- */}
        <div className="mt-14 grid grid-cols-1 gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5" y={36}>
            <div className="lg:sticky lg:top-28">
              <PortraitMosaic />
            </div>
          </Reveal>

          <div className="flex flex-col gap-10 lg:col-span-7 lg:pt-4">
            <Reveal delay={0.05} className="flex flex-col gap-5">
              {profile.bio.map((para, i) => (
                <p
                  key={i}
                  className={clsx(
                    "leading-[1.7]",
                    i === 0 ? "text-[18px] text-ink sm:text-[20px]" : "text-[16px] text-ink-muted sm:text-[17px]",
                  )}
                >
                  {para}
                </p>
              ))}
            </Reveal>

            {/* quick facts */}
            <Reveal delay={0.1}>
              <dl className="border-t border-ink/10">
                {facts.map((f) => (
                  <div
                    key={f.key}
                    className="group/fact flex flex-col gap-1 border-b border-ink/10 py-4 transition-colors hover:bg-white/60 sm:flex-row sm:items-baseline sm:gap-6 sm:px-2"
                  >
                    <dt className="w-32 shrink-0 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-faint transition-colors group-hover/fact:text-primary">
                      <span aria-hidden className="mr-1.5 text-primary">
                        ›
                      </span>
                      {f.key}
                    </dt>
                    <dd className="flex items-center gap-2.5 text-[15px] font-medium text-ink sm:text-[16px]">
                      {f.live && (
                        <span aria-hidden className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-success/60 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-state-success" />
                        </span>
                      )}
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* currently */}
            <Reveal delay={0.15}>
              <div className="relative overflow-hidden rounded-[28px] bg-navy-900 p-6 text-white shadow-[0_30px_60px_-30px_rgba(11,16,45,0.6)] sm:p-8">
                <GhostTiles opacity={0.05} className="absolute -right-24 -top-16 h-auto w-[420px]" />
                <QuarterCircle size={64} color="sky" rotate={90} className="absolute bottom-0 right-0 opacity-80" />
                <div className="relative flex items-center justify-between gap-4">
                  <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
                    <span className="text-white/40">&gt;</span> currently.running()
                  </p>
                  <span className="font-mono text-[11px] text-white/40">
                    {String(experiences.length).padStart(2, "0")} processes
                  </span>
                </div>
                <ul className="relative mt-6 flex flex-col">
                  {experiences.map((exp, i) => (
                    <li
                      key={exp.title}
                      className={clsx(
                        "group/exp flex items-center gap-4 py-4 transition-transform duration-300 hover:translate-x-1",
                        i > 0 && "border-t border-white/10",
                      )}
                    >
                      {exp.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- static export
                        <img
                          src={asset(exp.logo)}
                          alt=""
                          width={44}
                          height={44}
                          loading="lazy"
                          className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1.5"
                        />
                      ) : (
                        <GlyphMini className="h-11 w-11 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug sm:text-[16px]">{exp.title}</p>
                        <p className="mt-0.5 text-[13px] text-white/55 sm:text-[14px]">{exp.org}</p>
                      </div>
                      <span className="hidden shrink-0 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/60 transition-colors group-hover/exp:border-accent-cyan/60 group-hover/exp:text-accent-cyan sm:inline">
                        {exp.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------- stats ---------- */}
        <ul className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-24 lg:grid-cols-4 lg:gap-5">
          {stats.map((s, i) => {
            const tile = statTiles[i % statTiles.length];
            return (
              <li key={s.label}>
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="group/stat relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-primary/10 bg-surface p-5 shadow-[0_20px_50px_-28px_rgba(11,16,45,0.35)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-28px_rgba(47,65,153,0.5)] sm:p-7 lg:rounded-[28px]">
                    <QuarterCircle
                      size={56}
                      color={tile.color}
                      rotate={tile.rotate}
                      className="absolute right-0 top-0 h-10 w-10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stat:scale-125 sm:h-14 sm:w-14"
                    />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                      stat_{String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-6 flex items-baseline text-[38px] font-extrabold leading-none tracking-tight text-ink tabular-nums sm:text-[52px] lg:text-[60px]">
                      <StatCounter value={s.value} decimals={s.decimals ?? 0} />
                      {s.suffix && <span className={clsx("ml-0.5", tile.suffix)}>{s.suffix}</span>}
                    </p>
                    <p className="mt-3 text-[13px] leading-snug text-ink-muted sm:text-[15px]">{s.label}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
