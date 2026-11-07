import { projects, type Project } from "@/data/portfolio";

/** The five stages every agent in the loop visualisation goes through. */
export const LOOP_NODES = ["Perceive", "Reason", "Plan", "Act", "Learn"] as const;

export type LoopStep = { tag: string; caption: string };

export type AgentCase = {
  slug: string;
  label: string;
  /** Hex accent taken from the project's own brand colour. */
  accent: string;
  project: Project;
  /** One entry per LOOP_NODES item, same order. */
  steps: [LoopStep, LoopStep, LoopStep, LoopStep, LoopStep];
};

const bySlug = (slug: string): Project => {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project slug: ${slug}`);
  return p;
};

const waskita = bySlug("waskita");
const foundros = bySlug("foundros");

/**
 * Real pipeline steps, mapped onto the generic agent loop.
 * Every caption restates facts from src/data/portfolio.ts — nothing new.
 */
export const agentCases: AgentCase[] = [
  {
    slug: waskita.slug,
    label: waskita.title,
    accent: waskita.accent,
    project: waskita,
    steps: [
      {
        tag: "ESP32 meter",
        caption: "An ESP32 smart meter streams the shop's power telemetry into the platform.",
      },
      {
        tag: "NILM",
        caption: "Non-intrusive load monitoring disaggregates that one signal into per-appliance energy ledgers.",
      },
      {
        tag: "PPO · CP-SAT",
        caption:
          "A MaskablePPO policy shifts machine runs out of peak tariff hours across 96 daily 15-minute slots. Action masking means it can never break a production deadline; OR-Tools CP-SAT is the always-on baseline.",
      },
      {
        tag: "WhatsApp",
        caption:
          "A WhatsApp agent with OTP-verified numbers explains the savings: weekly bills and a PDF energy report card.",
      },
      {
        tag: "Digital twin",
        caption:
          "A digital twin with a weather model simulates the shop and re-sizes solar PV and batteries around the agent's schedule.",
      },
    ],
  },
  {
    slug: foundros.slug,
    label: foundros.title,
    accent: foundros.accent,
    project: foundros,
    steps: [
      {
        tag: "Telegram",
        caption: "Founders talk to the system through Telegram — requests in, approvals back.",
      },
      {
        tag: "LLM agents",
        caption:
          "Multi-agent reasoning on OpenClaw: each LLM agent owns one job — sourcing vendors, watching stock, paying suppliers.",
      },
      {
        tag: "Tool calls",
        caption: "Agents pick their tools: a map-based vendor search powered by Repliz, and a live watch on POS stock.",
      },
      {
        tag: "DOKU",
        caption: "Supplier payments go out through DOKU, approved straight from Telegram — agents that act, not advise.",
      },
      {
        tag: "Alerts",
        caption: "The moment inventory falls below 20%, an automatic POS stock alert fires and the loop starts again.",
      },
    ],
  },
];
