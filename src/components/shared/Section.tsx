import clsx from "clsx";
import type { ReactNode } from "react";

export type SectionProps = {
  /** "white" = bg-surface block; "canvas" = transparent over surface-alt; "teal" = solid primary. */
  tone?: "white" | "canvas" | "teal";
  /** Standard padding preset. Use "none" to supply your own. */
  spacing?: "content" | "hero" | "wide" | "band" | "none";
  id?: string;
  className?: string;
  children: ReactNode;
};

const tones = {
  white: "bg-surface",
  canvas: "bg-transparent",
  teal: "bg-primary text-surface-alt",
} as const;

const spacings = {
  // standard content section
  content: "px-4 py-8 lg:px-24 lg:py-16 gap-6 lg:gap-8",
  // hero
  hero: "px-4 py-16 lg:px-24 lg:py-24 gap-8",
  // wide strip (carousels)
  wide: "px-4 py-12 lg:px-12 lg:py-16 gap-6 lg:gap-8",
  // white logo band
  band: "px-4 py-16 lg:px-16 lg:py-24 gap-8",
  none: "",
} as const;

/** Full-width, centered column section using the reference paddings. */
export default function Section({
  tone = "canvas",
  spacing = "content",
  id,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "relative flex w-full flex-col items-center",
        tones[tone],
        spacings[spacing],
        className,
      )}
    >
      {children}
    </section>
  );
}
