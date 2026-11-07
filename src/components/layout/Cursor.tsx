"use client";

import { useEffect, useRef } from "react";
import "./layout.css";

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], [data-cursor], [data-cursor-label], label[for], select, summary, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]';
const TEXT_FIELD =
  'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';

/**
 * Dot + ring cursor (ported from the BEM UI kabinet cursor, refined):
 * - the dot tracks the pointer 1:1, the ring trails with a soft lerp;
 * - over links / buttons / [data-cursor] the ring swells into an inverting disc
 *   (the layer uses mix-blend-difference, so it reads on navy and on white);
 * - [data-cursor-label="View"] swaps to a solid saffron bubble with that label;
 * - text fields get the native caret back.
 * Only enabled on fine pointers with hover; touch devices never see it.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const labelText = labelTextRef.current;
    if (!dot || !ring || !label || !labelText) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let mx = -200;
    let my = -200;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let state = "";

    const place = (el: HTMLElement, x: number, y: number, s = 1) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)${s !== 1 ? ` scale(${s})` : ""}`;
    };

    const loop = () => {
      const k = reduce ? 1 : 0.18;
      rx += (mx - rx) * k;
      ry += (my - ry) * k;
      scale += (targetScale - scale) * (reduce ? 1 : 0.25);
      place(ring, rx, ry, scale);
      label.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      const settled =
        Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && Math.abs(targetScale - scale) < 0.002;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const setState = (next: string) => {
      if (next === state) return;
      state = next;
      if (next) root.dataset.cursorState = next;
      else delete root.dataset.cursorState;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx = e.clientX;
      my = e.clientY;
      place(dot, mx, my);
      if (root.dataset.cursorVisible !== "true") {
        // first move: snap the ring so it does not fly in from the corner
        rx = mx;
        ry = my;
        root.dataset.cursorVisible = "true";
      }
      kick();
    };

    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      if (t.closest(TEXT_FIELD)) {
        setState("text");
        return;
      }
      const labelled = t.closest<HTMLElement>("[data-cursor-label]");
      if (labelled) {
        labelText.textContent = labelled.dataset.cursorLabel || "View";
        setState("label");
        return;
      }
      setState(t.closest(INTERACTIVE) ? "hover" : "");
    };

    const onDown = () => {
      targetScale = 0.82;
      kick();
    };
    const onUp = () => {
      targetScale = 1;
      kick();
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) root.dataset.cursorVisible = "false";
    };
    const onBlur = () => {
      root.dataset.cursorVisible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });
    window.addEventListener("blur", onBlur);

    // Switching to touch (e.g. a 2-in-1 laptop) hands control back to the OS cursor.
    const onChange = () => {
      if (!fine.matches) {
        root.classList.remove("has-custom-cursor");
        root.dataset.cursorVisible = "false";
      } else {
        root.classList.add("has-custom-cursor");
      }
    };
    fine.addEventListener("change", onChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("blur", onBlur);
      fine.removeEventListener("change", onChange);
      root.classList.remove("has-custom-cursor");
      delete root.dataset.cursorState;
      delete root.dataset.cursorVisible;
    };
  }, []);

  return (
    <>
      <div className="nk-cursor-layer" aria-hidden="true">
        <div ref={ringRef} className="nk-cursor-ring" />
        <div ref={dotRef} className="nk-cursor-dot" />
      </div>
      <div ref={labelRef} className="nk-cursor-label" aria-hidden="true">
        <span ref={labelTextRef} />
      </div>
    </>
  );
}
