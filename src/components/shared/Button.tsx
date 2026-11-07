import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary" // solid teal (reference `solid`)
  | "secondary" // soft teal tint (reference `secondary`)
  | "outlined" // white + teal border (reference `outlined`)
  | "white" // white bg, teal text, no border (hero on teal)
  | "ghost" // transparent, teal text
  | "saffron" // yellow CTA (reference `golden`)
  | "coral" // coral solid
  | "success"
  | "disabled";

export type ButtonSize = "default" | "compact";

const base =
  "inline-flex items-center justify-center gap-2 text-sm md:text-base font-semibold rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const sizes: Record<ButtonSize, string> = {
  default: "pt-3 pb-3 pl-4 pr-4 md:pt-4 md:pb-4 md:pl-6 md:pr-6",
  compact: "pt-3 pb-3 pl-4 pr-4 md:pt-2.5 md:pb-2.5 md:pl-6 md:pr-6",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-primary border-primary hover:bg-primary-hover hover:border-primary-hover",
  secondary:
    "text-primary bg-primary-soft border-primary-soft hover:bg-primary-light hover:border-primary-light active:scale-95",
  outlined:
    "text-primary bg-surface border-primary hover:bg-alabaster active:bg-alabaster",
  white: "text-primary bg-surface border-0 hover:bg-alabaster",
  ghost: "text-primary bg-transparent border-0 hover:bg-accent-sky/15",
  saffron:
    "text-ink bg-accent-saffron border-accent-saffron hover:bg-accent-saffron-soft hover:border-accent-saffron-soft",
  coral:
    "text-white bg-accent-coral border-accent-coral hover:brightness-95",
  success:
    "text-white bg-state-success border-state-success hover:bg-state-success-hover hover:border-state-success-hover",
  disabled: "text-white bg-ink-muted border-ink-muted cursor-not-allowed",
};

/** Returns the class string so non-button elements can look like a Button. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "default",
  className?: string,
) {
  return clsx(base, sizes[size], variants[variant], className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type AsLinkProps = CommonProps & {
  /** When set the button renders as a link. Internal paths use next/link. */
  href: string;
  /** Force opening in a new tab (auto for http(s) URLs). */
  external?: boolean;
  onClick?: () => void;
};

type AsButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonProps = AsLinkProps | AsButtonProps;

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "default", className, children } = props;
  const classes = buttonClasses(variant, size, className);

  if (props.href !== undefined) {
    const isExternal = props.external ?? /^https?:\/\//.test(props.href);
    if (isExternal) {
      return (
        <a
          href={props.href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          onClick={props.onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    href: _h,
    type = "button",
    ...rest
  } = props;
  void _v;
  void _s;
  void _c;
  void _ch;
  void _h;
  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={variant === "disabled" || rest.disabled}
    >
      {children}
    </button>
  );
}
