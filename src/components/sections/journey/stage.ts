import type { JourneyStage } from "@/data/portfolio";

/** Per-stage accent rhythm (hackvidia four-colour tiles, navy-tuned). */
export const STAGE_ACCENTS = [
  {
    solid: "bg-accent-coral",
    soft: "bg-accent-coral-soft",
    text: "text-accent-coral",
    ring: "ring-accent-coral/30",
    tileA: "bg-accent-saffron",
    tileB: "bg-primary",
    quarter: "coral",
  },
  {
    solid: "bg-accent-sky",
    soft: "bg-skywash",
    text: "text-accent-sky",
    ring: "ring-accent-sky/30",
    tileA: "bg-accent-coral",
    tileB: "bg-accent-saffron",
    quarter: "sky",
  },
  {
    solid: "bg-accent-saffron",
    soft: "bg-butter",
    text: "text-primary",
    ring: "ring-accent-saffron/40",
    tileA: "bg-primary",
    tileB: "bg-accent-sky",
    quarter: "saffron",
  },
] as const;

export type StageAccent = (typeof STAGE_ACCENTS)[number];

export const accentFor = (i: number): StageAccent => STAGE_ACCENTS[i % STAGE_ACCENTS.length];

/** "2019 — 2022" → "2019"; "2025 — Present" → "2025". */
export const startYear = (s: JourneyStage) => s.period.split("—")[0].trim();
