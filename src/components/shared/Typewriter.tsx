"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

export type TypewriterSegment = {
  text: string;
  /** Classes for this run of text (e.g. "text-primary"). */
  className?: string;
  /** Pause (ms) before this segment starts typing. */
  pauseBefore?: number;
  /** Insert a <br/> after this segment. */
  breakAfter?: boolean;
};

export type TypewriterProps = {
  segments: TypewriterSegment[];
  /** ms per character (reference: 50). */
  delay?: number;
  /** Pause after typing finishes before the cursor hides (reference: 1000). */
  endPause?: number;
  /** Hide the cursor once done (reference: true). */
  hideCursorOnDone?: boolean;
  cursor?: string;
  /** Render the full text invisibly underneath so layout doesn't grow while typing. */
  reserveSpace?: boolean;
  className?: string;
};

/**
 * Minimal typewriter (replaces the `typewriter-effect` package).
 * Types each segment once (no loop), blinking "|" cursor positioned
 * absolutely so it never reflows text. Respects prefers-reduced-motion.
 * The full sentence is exposed to screen readers immediately.
 *
 * Reference hero usage:
 *   <h1 className="..."><Typewriter segments={[
 *     { text: "Line one,", pauseBefore: 300, breakAfter: true },
 *     { text: "highlighted line", className: "text-primary", pauseBefore: 600 },
 *   ]}/></h1>
 */
export default function Typewriter({
  segments: segmentsProp,
  delay = 50,
  endPause = 1000,
  hideCursorOnDone = true,
  cursor = "|",
  reserveSpace = false,
  className,
}: TypewriterProps) {
  // Stable identity even when the parent passes a fresh array each render.
  const segKey = JSON.stringify(segmentsProp);
  const segments = useMemo(
    () => JSON.parse(segKey) as TypewriterSegment[],
    [segKey],
  );
  const total = useMemo(
    () => segments.reduce((n, s) => n + s.text.length, 0),
    [segments],
  );
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      timers.push(
        setTimeout(() => {
          setCount(total);
          setDone(true);
        }, 0),
      );
      return () => timers.forEach(clearTimeout);
    }

    timers.push(
      setTimeout(() => {
        setCount(0);
        setDone(false);
      }, 0),
    );
    let t = 0;
    let typed = 0;
    for (const seg of segments) {
      t += seg.pauseBefore ?? 0;
      for (let i = 0; i < seg.text.length; i++) {
        t += delay;
        typed += 1;
        const value = typed;
        timers.push(setTimeout(() => setCount(value), t));
      }
    }
    timers.push(setTimeout(() => setDone(true), t + endPause));
    return () => timers.forEach(clearTimeout);
  }, [segments, delay, endPause, total]);

  // Character offset at which each segment starts.
  const starts = segments.reduce<number[]>(
    (acc, seg, i) => [...acc, i === 0 ? 0 : acc[i - 1] + segments[i - 1].text.length],
    [],
  );
  const typedNodes = segments.map((seg, i) => {
    const avail = count - starts[i];
    const shown = seg.text.slice(0, Math.max(0, Math.min(seg.text.length, avail)));
    const reached = avail >= seg.text.length;
    return (
      <Fragment key={i}>
        {shown && <span className={seg.className}>{shown}</span>}
        {seg.breakAfter && reached && <br />}
      </Fragment>
    );
  });

  const fullText = segments.map((s) => s.text).join(" ");
  const showCursor = !(done && hideCursorOnDone);

  const cursorEl = showCursor ? (
    <span className="relative">
      <span className="absolute ml-px animate-cursor-blink">{cursor}</span>
    </span>
  ) : null;

  return (
    <span className={clsx("relative inline-block w-full", className)}>
      <span className="sr-only">{fullText}</span>
      {reserveSpace ? (
        <span aria-hidden className="relative block">
          <span className="invisible">
            {segments.map((seg, i) => (
              <Fragment key={i}>
                <span className={seg.className}>{seg.text}</span>
                {seg.breakAfter && <br />}
              </Fragment>
            ))}
          </span>
          <span className="absolute inset-0">
            {typedNodes}
            {cursorEl}
          </span>
        </span>
      ) : (
        <span aria-hidden>
          {typedNodes}
          {cursorEl}
        </span>
      )}
    </span>
  );
}
