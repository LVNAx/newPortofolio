import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

/**
 * Reference `Typography` component. Variant -> classes are the exact
 * mobile -> lg type scale used across the reference site.
 */
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "large"
  | "medium"
  | "regular"
  | "small";

export const typographyClasses: Record<TypographyVariant, string> = {
  h1: "text-[3rem] lg:text-[4rem] leading-[140%] font-bold",
  h2: "text-[1.5rem] lg:text-[2rem] leading-[2.1rem] lg:leading-[2.8rem] font-bold",
  h3: "text-[1.25rem] lg:text-[1.5rem] leading-[1.75rem] lg:leading-[2.1rem] font-bold",
  h4: "text-[1.125rem] lg:text-[1.25rem] leading-[1.575rem] lg:leading-[1.75rem] lg:font-bold",
  large:
    "text-[0.875rem] lg:text-[1.125rem] leading-[1.225rem] lg:leading-[1.575rem]",
  medium: "text-[0.875rem] lg:text-[1rem] leading-[1.4rem] lg:leading-[1.6rem]",
  regular:
    "text-[0.75rem] lg:text-[0.875rem] leading-[1.2rem] lg:leading-[1.4rem]",
  small:
    "text-[0.625rem] lg:text-[0.75rem] leading-[0.875rem] lg:leading-[1.2rem]",
};

const defaultTag: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  large: "p",
  medium: "p",
  regular: "p",
  small: "span",
};

const weights = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

export type TypographyProps = {
  variant?: TypographyVariant;
  /** Override the rendered tag (e.g. render an h2-styled <p>). */
  as?: ElementType;
  weight?: keyof typeof weights;
  className?: string;
  id?: string;
  children: ReactNode;
};

export default function Typography({
  variant = "regular",
  as,
  weight,
  className,
  id,
  children,
}: TypographyProps) {
  const Tag = as ?? defaultTag[variant];
  return (
    <Tag
      id={id}
      className={clsx(
        typographyClasses[variant],
        weight && weights[weight],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
