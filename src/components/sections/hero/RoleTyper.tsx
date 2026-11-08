"use client";

import { useEffect, useState } from "react";

/**
 * Rotating role word: each word slides up into place, holds, then hands over to the next.
 * Reduced motion → the first word, static. Screen readers get the full list once.
 */
export default function RoleTyper({ words, reduced, className }: { words: readonly string[]; reduced: boolean; className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [words, reduced]);

  const word = words[reduced ? 0 : i % Math.max(1, words.length)] ?? "";

  return (
    <span className={className}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="hero-word-mask">
        <span key={word} className="hero-word hero-typer-text">
          {word}
        </span>
      </span>
    </span>
  );
}
