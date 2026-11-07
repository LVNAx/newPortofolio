/**
 * Tiny scroll helpers shared by the shell (Navbar, Footer, Contact, SmoothScroll).
 * Works with Lenis when it is running (window.__lenis) and falls back to native scroll.
 */

/** Height of the fixed navbar; in-page jumps land this far below the section top. */
export const NAV_OFFSET = 72;

export type LenisLike = {
  stop(): void;
  start(): void;
  scrollTo(target: string | number | HTMLElement, options?: object): void;
};

export function getLenis(): LenisLike | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __lenis?: LenisLike }).__lenis;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Expo-out, the site-wide easing (cubic-bezier(0.16,1,0.3,1) feel). */
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Resolve "#id", "/#id", a full URL with a hash, or a pixel value to a document Y. */
function resolveTop(target: string | number): number | null {
  if (typeof target === "number") return target;
  const hash = target.includes("#") ? target.slice(target.indexOf("#") + 1) : target;
  if (!hash || hash === "top") return 0;
  let el: HTMLElement | null = null;
  try {
    el = document.getElementById(decodeURIComponent(hash));
  } catch {
    el = document.getElementById(hash);
  }
  if (!el) return null;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
}

/**
 * Smoothly scroll to a hash / element id / pixel value.
 * Returns false when the target does not exist (caller may fall back to default navigation).
 */
export function scrollToTarget(target: string | number): boolean {
  const top = resolveTop(target);
  if (top === null) return false;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.25, easing: expoOut, force: true });
  } else {
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }
  return true;
}

/** Move keyboard focus to a section after an in-page jump, without scrolling again. */
export function focusTarget(hash: string) {
  const id = hash.replace(/^.*#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const hadTabIndex = el.hasAttribute("tabindex");
  if (!hadTabIndex) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  if (!hadTabIndex) {
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }
}
