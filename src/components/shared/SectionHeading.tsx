import clsx from "clsx";
import type { ReactNode } from "react";
import { typographyClasses } from "./Typography";

/** Inline brand-colored keyword inside a heading ("the <Highlight>coolest</Highlight> events"). */
export function Highlight({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "coral" | "saffron" | "sky";
  className?: string;
}) {
  const tones = {
    primary: "text-primary",
    coral: "text-accent-coral",
    saffron: "text-accent-saffron",
    sky: "text-accent-sky",
  } as const;
  return <span className={clsx(tones[tone], className)}>{children}</span>;
}

/** Small uppercase label above a heading (e.g. "ABOUT HYPOMONĒ"). */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "text-[0.875rem] lg:text-[1.125rem] font-bold uppercase text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}

export type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  /** Heading tag; defaults to h2. */
  as?: "h1" | "h2" | "h3";
  /** "dark" = ink text (default); "light" = for teal backgrounds. */
  theme?: "dark" | "light";
  titleClassName?: string;
  leadClassName?: string;
  className?: string;
};

/**
 * Standard centered section header: H2 (24 -> 32px bold) + lead paragraph
 * (14 -> 18px), matching the reference section rhythm.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  as: Tag = "h2",
  theme = "dark",
  titleClassName,
  leadClassName,
  className,
}: SectionHeadingProps) {
  const color = theme === "dark" ? "text-ink" : "text-surface-alt";
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 lg:gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag
        className={clsx(typographyClasses.h2, "max-w-5xl", color, titleClassName)}
      >
        {title}
      </Tag>
      {lead && (
        <p
          className={clsx(typographyClasses.large, "max-w-2xl", color, leadClassName)}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
