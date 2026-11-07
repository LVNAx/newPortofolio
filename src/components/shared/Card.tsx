import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/** Reference `Card`: 16px radius, 1px default border, Tailwind `shadow`. */
export default function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      {...rest}
      className={clsx("rounded-2xl border border-gray-200 shadow", className)}
    >
      {children}
    </div>
  );
}
