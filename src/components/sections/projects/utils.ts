"use client";

import { useSyncExternalStore } from "react";
import { projectCategories, type Project, type ProjectCategory } from "@/data/portfolio";

/* ------------------------------------------------------------------ */
/* Deterministic randomness (generated covers must be stable per slug) */

/** FNV-1a 32-bit hash of a string. */
export function hashString(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG seeded from a number. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Presentation helpers (no new facts — only how existing data is shown) */

export const categoryLabel = (key: ProjectCategory) =>
  projectCategories.find((c) => c.key === key)?.label ?? key;

/** Short category name for chips and compact counts. */
export const categoryTag: Record<ProjectCategory, string> = {
  agents: "AI agents",
  ml: "ML & data",
  web: "Web & 3D",
};

/**
 * Per-slug crop hints. The Hypomone @LV and BEM UI shots are 16:9 desktop
 * captures with the hero object (galaxy / 3D logo) in the middle and a nav
 * bar on top — nudge the crop slightly up so the nav stays when the frame
 * is taller than 16:9. BDC is a very wide banner, keep it centred.
 */
const objectPositions: Record<string, string> = {
  "hypomone-lv": "50% 42%",
  "bem-ui": "50% 40%",
  "bdc-waste": "50% 50%",
  waskita: "60% 40%",
};
export const objectPositionFor = (slug: string) => objectPositions[slug] ?? "50% 50%";

/** Portrait artwork shown as a tilted "sheet" over a generated cover instead of being cropped. */
const posterSlugs = new Set<string>([]);
export const isPoster = (slug: string) => posterSlugs.has(slug);

/** Mix a hex colour with white (amount 0..1) — for soft tints of the accent. */
export function tint(hex: string, amount: number) {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** hex -> "r, g, b" for rgba() strings. */
export function rgb(hex: string) {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  return `${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Plain-language call to action for a project link (labels come from the data file). */
export function linkCta(label: string, href: string) {
  if (/^live$/i.test(label)) return "Visit live site";
  if (/github/i.test(label) || /github\.com/i.test(href)) return "View on GitHub";
  if (/devpost/i.test(label) || /devpost\.com/i.test(href)) return "View on Devpost";
  return `Visit ${label}`;
}

/** Host name shown under a link button, e.g. "bemui.site". */
export function linkHost(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/* ------------------------------------------------------------------ */
/* Lenis + media queries                                                */

type LenisLike = {
  stop(): void;
  start(): void;
  scrollTo(t: string | number | HTMLElement, o?: object): void;
};

export const getLenis = () =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { __lenis?: LenisLike }).__lenis;

/** SSR-safe matchMedia subscription (false on the server). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};
/** true after hydration on the client (for portals). */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export type { Project };
