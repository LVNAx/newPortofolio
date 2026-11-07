import clsx from "clsx";
import { Image as ImageIcon, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

export type PlaceholderTone =
  | "primary"
  | "coral"
  | "saffron"
  | "sky"
  | "mint"
  | "deep";

const tones: Record<PlaceholderTone, { bg: string; fg: string }> = {
  primary: { bg: "bg-linear-to-br from-primary-soft via-mint to-primary-light", fg: "text-primary" },
  coral: { bg: "bg-linear-to-br from-peach via-accent-coral-soft to-butter", fg: "text-accent-coral" },
  saffron: { bg: "bg-linear-to-br from-butter via-accent-saffron-soft/60 to-peach", fg: "text-primary-deep" },
  sky: { bg: "bg-linear-to-br from-skywash via-accent-sky-soft/50 to-mint", fg: "text-accent-sky" },
  mint: { bg: "bg-linear-to-br from-teal-mist via-mint to-skywash", fg: "text-primary-hover" },
  deep: { bg: "bg-linear-to-b from-primary-night to-primary", fg: "text-primary-soft" },
};

const toneOrder: PlaceholderTone[] = ["primary", "coral", "sky", "saffron", "mint"];

export type ImagePlaceholderProps = {
  /** Short caption describing the intended photo ("Hackathon stage"). */
  label?: string;
  /** Color family; or pass `seed` to rotate tones automatically. */
  tone?: PlaceholderTone;
  /** Any integer — picks a tone from the palette rotation when `tone` is omitted. */
  seed?: number;
  icon?: LucideIcon;
  /**
   * Fill the nearest positioned parent (absolute inset-0) — the drop-in
   * equivalent of next/image `fill`. Default true.
   */
  fill?: boolean;
  /** CSS aspect-ratio when not filling, e.g. "16/9", "272/400". */
  aspect?: string;
  /** Radius + any sizing classes. Defaults to "rounded-2xl". */
  className?: string;
  hideLabel?: boolean;
};

/**
 * Stand-in for photos. Keeps the exact geometry of the slot it is given,
 * so collages and cards keep their layout. To swap for a real photo:
 *   <Image src="/photos/x.jpg" alt="…" fill className="object-cover rounded-2xl" />
 */
export default function ImagePlaceholder({
  label,
  tone,
  seed = 0,
  icon: Icon = ImageIcon,
  fill = true,
  aspect,
  className,
  hideLabel = false,
}: ImagePlaceholderProps) {
  const t = tones[tone ?? toneOrder[Math.abs(seed) % toneOrder.length]];
  const style: CSSProperties | undefined = aspect ? { aspectRatio: aspect } : undefined;
  return (
    <div
      role="img"
      aria-label={label ?? "Image placeholder"}
      style={style}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 overflow-hidden",
        fill ? "absolute inset-0 h-full w-full" : "relative w-full",
        t.bg,
        t.fg,
        className ?? "rounded-2xl",
      )}
    >
      {/* subtle quarter-circle motif */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute right-0 bottom-0 h-1/2 w-1/2 opacity-20"
      >
        <path d="M100 100 H0 A100 100 0 0 1 100 0 Z" fill="currentColor" />
      </svg>
      <Icon aria-hidden className="relative h-6 w-6 opacity-70 lg:h-8 lg:w-8" strokeWidth={1.75} />
      {label && !hideLabel && (
        <span className="relative max-w-[90%] truncate px-2 text-center text-[10px] font-semibold opacity-80 lg:text-xs">
          {label}
        </span>
      )}
    </div>
  );
}
