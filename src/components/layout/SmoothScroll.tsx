"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { focusTarget, scrollToTarget } from "./scroll";

/**
 * Global smooth scroll (Lenis), ported from the BEM UI company profile.
 * - Instance lives on `window.__lenis` (modals call stop()/start()).
 * - GSAP ScrollTrigger is driven by Lenis so scroll-linked scenes stay in sync.
 * - In-page anchor clicks (#id) glide to the section, 72px below the fixed navbar.
 * - Disabled entirely under prefers-reduced-motion (native scroll, instant jumps).
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = window as unknown as { __lenis?: Lenis };

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let mo: MutationObserver | null = null;

    if (!reduce) {
      const instance = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.9,
        // Dialogs / scrollable panels keep their own native scroll.
        prevent: (node) => !!node.closest?.('[role="dialog"], [data-lenis-prevent]'),
      });
      lenis = instance;
      w.__lenis = instance;

      instance.on("scroll", ScrollTrigger.update);
      tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Panels that lock the page with overflow:hidden on <html>/<body> also pause Lenis.
      // Only act on transitions so we never reset an in-flight programmatic scroll.
      const html = document.documentElement;
      const isLocked = () =>
        html.style.overflow === "hidden" || document.body.style.overflow === "hidden";
      let locked = isLocked();
      mo = new MutationObserver(() => {
        const next = isLocked();
        if (next === locked) return;
        locked = next;
        if (next) instance.stop();
        else instance.start();
      });
      mo.observe(html, { attributes: true, attributeFilter: ["style"] });
      mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });

      // Layout may shift once fonts / images settle.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });
    }

    // Capture phase: runs before next/link or React handlers see the click.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-scroll-manual")) return;
      const raw = a.getAttribute("href") ?? "";
      if (!raw.includes("#")) return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      const samePage =
        url.origin === window.location.origin &&
        url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");
      if (!samePage) return;

      const hash = url.hash; // "" or "#id"
      if (!scrollToTarget(hash || "#top")) return;
      e.preventDefault();

      if (hash && hash !== "#top") {
        try {
          window.history.replaceState(window.history.state, "", hash);
        } catch {
          /* ignore */
        }
        focusTarget(hash);
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      mo?.disconnect();
      if (tick) gsap.ticker.remove(tick);
      if (lenis) {
        lenis.destroy();
        if (w.__lenis === lenis) delete w.__lenis;
      }
    };
  }, []);

  return null;
}
