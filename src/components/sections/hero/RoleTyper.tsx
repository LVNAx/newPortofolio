"use client";

import { useEffect, useState } from "react";

type State = { w: number; n: number; del: boolean };

/**
 * Looping typewriter: types a word, holds, deletes, moves to the next.
 * Reduced motion → the first word, static. Screen readers get the full list once.
 */
export default function RoleTyper({ words, reduced, className }: { words: readonly string[]; reduced: boolean; className?: string }) {
  const [s, setS] = useState<State>({ w: 0, n: 0, del: false });

  useEffect(() => {
    if (reduced || words.length === 0) return;
    const word = words[s.w % words.length];
    let delay = s.del ? 34 : 72;
    let next: State;
    if (!s.del && s.n >= word.length) {
      delay = 1800;
      next = { ...s, del: true };
    } else if (s.del && s.n <= 0) {
      delay = 320;
      next = { w: (s.w + 1) % words.length, n: 0, del: false };
    } else {
      next = { ...s, n: s.n + (s.del ? -1 : 1) };
    }
    const id = setTimeout(() => setS(next), s.w === 0 && s.n === 0 && !s.del ? 900 : delay);
    return () => clearTimeout(id);
  }, [s, words, reduced]);

  const text = reduced ? (words[0] ?? "") : (words[s.w % Math.max(1, words.length)] ?? "").slice(0, s.n);

  return (
    <span className={className}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="hero-typer-text">
        {text}
      </span>
      <span aria-hidden className="hero-caret" />
    </span>
  );
}
