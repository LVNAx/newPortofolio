import clsx from "clsx";
import { useId } from "react";

/**
 * Flat geometric decorators (Bauhaus/Memphis tiles) redrawn as original
 * inline SVGs. Every component:
 *   - is purely decorative (aria-hidden, pointer-events-none),
 *   - renders at its natural size via width/height props on the <svg>
 *     (override with className, e.g. "w-1/4 h-auto lg:w-fit"),
 *   - wraps shapes in a group at a low opacity like the reference, so
 *     saturated palette colors read as pastels. Pass `opacity={1}` for the
 *     full-strength mosaics (portfolio hero).
 * Position them yourself: `className="absolute left-0 top-0"`.
 */

export type DecoratorProps = {
  className?: string;
  /** Group opacity (defaults follow the reference per shape). */
  opacity?: number;
};

const svgBase = "pointer-events-none select-none";

const C = {
  primary: "fill-primary",
  vivid: "fill-primary-vivid",
  coral: "fill-accent-coral",
  saffron: "fill-accent-saffron",
  sky: "fill-accent-sky",
  white: "fill-surface",
} as const;

/** Generic quarter circle of side `size` with its square corner at (0,0) -> arc toward (size,size). */
export function QuarterCircle({
  size = 56,
  color = "primary",
  rotate = 0,
  className,
}: {
  size?: number;
  color?: keyof typeof C;
  /** 0 | 90 | 180 | 270 — rotates which corner holds the right angle. */
  rotate?: 0 | 90 | 180 | 270;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <path
        d={`M0 0 H${size} A${size} ${size} 0 0 1 0 ${size} Z`}
        className={C[color]}
        transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/**
 * Hero top-left (248×122, opacity .3): coral block behind an S-shaped
 * pair of sky "petals" (two quarter circles, opposite corners).
 */
export function LeafCorner({ className, opacity = 0.3 }: DecoratorProps) {
  return (
    <svg
      width={248}
      height={122}
      viewBox="0 0 248 122"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity}>
        <rect x="0" y="0" width="124" height="122" className={C.coral} />
        <path d="M124 122 H1 A123 123 0 0 1 124 -1 Z" className={C.sky} />
        <path d="M124 0 H247 A123 123 0 0 1 124 123 Z" className={C.sky} />
      </g>
    </svg>
  );
}

/**
 * Hero bottom-left (465×310, opacity .2) on a 155px grid: teal quarter
 * disc over a teal square, a diagonally split saffron/sky square, and a
 * saffron quarter disc.
 */
export function TileCluster({ className, opacity = 0.2 }: DecoratorProps) {
  return (
    <svg
      width={465}
      height={310}
      viewBox="0 0 465 310"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity}>
        <path d="M0 155 V0 A155 155 0 0 1 155 155 Z" className={C.primary} />
        <rect x="0" y="155" width="155" height="155" className={C.primary} />
        <path d="M155 155 H310 V310 Z" className={C.saffron} />
        <path d="M155 155 L310 310 H155 Z" className={C.sky} />
        <path d="M310 310 V155 A155 155 0 0 1 465 310 Z" className={C.saffron} />
      </g>
    </svg>
  );
}

/**
 * Corner "moon" (325×325, opacity .2): sky block, a saffron concave
 * corner (square minus a big quarter circle) and a teal quarter disc in
 * the top-right. Use top-right as-is, bottom-left with `rotate-180`.
 */
export function MoonCorner({ className, opacity = 0.2 }: DecoratorProps) {
  return (
    <svg
      width={325}
      height={325}
      viewBox="0 0 325 325"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity}>
        <rect x="163" y="0" width="162" height="162" className={C.sky} />
        <path d="M0 0 H325 V325 A325 325 0 0 0 0 0 Z" className={C.saffron} />
        <path d="M325 0 V163 A163 163 0 0 1 162 0 Z" className={C.primary} />
      </g>
    </svg>
  );
}

/**
 * Card backdrop (288×276, opacity .14) on a 144px module: sky square with
 * a saffron half-disc and coral ring, coral almond, coral square, and a
 * saffron fern of six leaves along a stem.
 */
export function CardDeco({ className, opacity = 0.14 }: DecoratorProps) {
  const leaves = [30, 70, 110];
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      width={288}
      height={276}
      viewBox="0 0 288 276"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <defs>
        <clipPath id={`cardDecoCell-${uid}`}>
          <rect x="144" y="0" width="144" height="144" />
        </clipPath>
      </defs>
      <g opacity={opacity}>
        <rect x="144" y="0" width="144" height="144" className={C.sky} />
        <g clipPath={`url(#cardDecoCell-${uid})`}>
          <path d="M156 144 A60 60 0 0 1 276 144 Z" className={C.saffron} />
          <circle
            cx="216"
            cy="144"
            r="96"
            fill="none"
            strokeWidth="24"
            className="stroke-accent-coral"
          />
        </g>
        <path
          d="M144 210 A100 100 0 0 1 288 210 A100 100 0 0 1 144 210 Z"
          className={C.coral}
        />
        <rect x="0" y="144" width="144" height="132" className={C.coral} />
        <rect x="12" y="68" width="120" height="8" rx="4" className={C.saffron} />
        {leaves.map((x) => (
          <g key={x}>
            <ellipse
              cx={x + 10}
              cy={52}
              rx={18}
              ry={7}
              transform={`rotate(-35 ${x + 10} 52)`}
              className={C.saffron}
            />
            <ellipse
              cx={x + 10}
              cy={92}
              rx={18}
              ry={7}
              transform={`rotate(35 ${x + 10} 92)`}
              className={C.saffron}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * Dense 56px-grid tile mosaic anchored bottom-left (337×281). Full
 * opacity by default (portfolio hero). Mirror for other corners with
 * `-scale-x-100` / `rotate-180`.
 */
export function MosaicLeft({ className, opacity = 1 }: DecoratorProps) {
  const u = 56;
  return (
    <svg
      width={337}
      height={281}
      viewBox="0 0 337 281"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity}>
        {/* row 0 */}
        <path d={`M0 0 H${u} L0 ${u} Z`} className={C.coral} />
        {/* row 1 */}
        <rect x="0" y={u} width={u} height={u} className={C.saffron} />
        <path
          d={`M${u * 1.5} ${u} L${u * 2} ${u * 1.5} L${u * 1.5} ${u * 2} L${u} ${u * 1.5} Z`}
          className={C.sky}
        />
        {/* row 2 */}
        <path d={`M0 ${u * 3} V${u * 2} A${u} ${u} 0 0 1 ${u} ${u * 3} Z`} className={C.primary} />
        <rect x={u} y={u * 2} width={u} height={u} className={C.coral} />
        <path d={`M${u * 2} ${u * 3} A${u / 2} ${u / 2} 0 0 1 ${u * 3} ${u * 3} Z`} className={C.primary} />
        {/* row 3 */}
        <rect x="0" y={u * 3} width={u} height={u} className={C.sky} />
        <path d={`M${u} ${u * 3} H${u * 2} V${u * 4} Z`} className={C.saffron} />
        <rect x={u * 2} y={u * 3} width={u} height={u} className={C.primary} />
        <path
          d={`M${u * 3.5} ${u * 3} L${u * 4} ${u * 3.5} L${u * 3.5} ${u * 4} L${u * 3} ${u * 3.5} Z`}
          className={C.primary}
        />
        {/* row 4 (bottom edge) */}
        <path d={`M0 281 V${u * 4} A${u} ${u} 0 0 1 ${u} 281 Z`} className={C.coral} />
        <rect x={u} y={u * 4} width={u} height={u + 1} className={C.saffron} />
        <path d={`M${u * 2} 281 V${u * 4} A${u} ${u} 0 0 1 ${u * 3} 281 Z`} className={C.coral} />
        <path d={`M${u * 3} 281 V${u * 4} A${u} ${u} 0 0 1 ${u * 4} 281 Z`} className={C.saffron} />
        <path d={`M${u * 4} 281 L${u * 5} ${u * 4} V281 Z`} className={C.sky} />
        <path d={`M${u * 5} 281 V${u * 4} A${u} ${u} 0 0 1 337 281 Z`} className={C.primary} />
      </g>
    </svg>
  );
}

/** Companion mosaic anchored top-right (337×281). */
export function MosaicRight({ className, opacity = 1 }: DecoratorProps) {
  const u = 56;
  return (
    <svg
      width={337}
      height={281}
      viewBox="0 0 337 281"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity}>
        {/* top row */}
        <path d={`M1 0 A${u} ${u} 0 0 0 ${u + 1} ${u} V0 Z`} className={C.primary} />
        <path d={`M${u + 1} 0 H${u * 2 + 1} V${u} Z`} className={C.saffron} />
        <rect x={u * 2 + 1} y="0" width={u} height={u} className={C.coral} />
        <path d={`M${u * 3 + 1} 0 L${u * 4 + 1} ${u} H${u * 3 + 1} Z`} className={C.sky} />
        <rect x={u * 4 + 1} y="0" width={u} height={u} className={C.saffron} />
        <path d={`M${u * 5 + 1} 0 H337 V${u} A${u} ${u} 0 0 1 ${u * 5 + 1} 0 Z`} className={C.primary} />
        {/* row 1 */}
        <path d={`M${u * 2 + 1} ${u} H${u * 3 + 1} L${u * 3 + 1} ${u * 2} Z`} className={C.coral} />
        <path d={`M${u * 3 + 1} ${u} A${u / 2} ${u / 2} 0 0 0 ${u * 4 + 1} ${u} Z`} className={C.saffron} />
        <rect x={u * 4 + 1} y={u} width={u} height={u} className={C.sky} />
        <path d={`M${u * 5 + 1} ${u} H337 V${u * 2} Z`} className={C.coral} />
        {/* row 2 */}
        <path d={`M${u * 4 + 1} ${u * 2} L${u * 5 + 1} ${u * 3} H${u * 4 + 1} Z`} className={C.primary} />
        <rect x={u * 5 + 1} y={u * 2} width={u} height={u} className={C.saffron} />
        {/* row 3 / 4 — big teal circle and saffron semicircle cut by the edge */}
        <circle cx={u * 5.5 + 1} cy={u * 4} r={u / 2} className={C.primary} />
        <path d={`M337 ${u * 3} A${u} ${u} 0 0 0 337 ${u * 5} Z`} className={C.saffron} />
        <path d={`M${u * 3 + 1} ${u * 2} L${u * 4 + 1} ${u * 2} L${u * 4 + 1} ${u * 3} Z`} className={C.sky} />
      </g>
    </svg>
  );
}

/**
 * Ghosted white geometry for solid teal heroes (reference opacity
 * 0.04–0.11): squares, rings, quarter circles, triangles and sparkles.
 * 600×480, scale with className (e.g. "h-1/2 w-auto lg:h-full").
 */
export function GhostTiles({ className, opacity = 0.09 }: DecoratorProps) {
  const u = 120;
  const sparkle = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
  return (
    <svg
      width={600}
      height={480}
      viewBox="0 0 600 480"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <g opacity={opacity} className={C.white}>
        <rect x={u * 4} y="0" width={u} height={u} />
        <path d={`M${u * 3} ${u} V0 A${u} ${u} 0 0 1 ${u * 4} ${u} Z`} />
        <circle cx={u * 2.5} cy={u * 1.5} r={u / 2} />
        <path
          d={`M${u * 4} ${u * 1.5} a${u / 2} ${u / 2} 0 1 0 ${u} 0 a${u / 2} ${u / 2} 0 1 0 -${u} 0 Z M${u * 4.25} ${u * 1.5} a${u / 4} ${u / 4} 0 1 1 ${u / 2} 0 a${u / 4} ${u / 4} 0 1 1 -${u / 2} 0 Z`}
          fillRule="evenodd"
        />
        <path d={`M${u} ${u * 3} L${u * 2} ${u * 2} V${u * 3} Z`} />
        <rect x={u * 2} y={u * 2} width={u} height={u} />
        <path d={`M${u * 3} ${u * 3} V${u * 2} A${u} ${u} 0 0 1 ${u * 4} ${u * 3} Z`} />
        <rect x="0" y={u * 3} width={u} height={u} />
        <path d={`M${u} ${u * 4} A${u} ${u} 0 0 1 ${u * 2} ${u * 3} V${u * 4} Z`} />
        <circle cx={u * 3.5} cy={u * 3.5} r={u / 2} />
        <path d={`M${u * 4} ${u * 4} L${u * 5} ${u * 3} V${u * 4} Z`} />
        <path d={sparkle(u * 2.5, u * 3.5, 34)} />
        <path d={sparkle(u * 4.5, u * 2.5, 30)} />
      </g>
    </svg>
  );
}

/** Mobile-only horizontal strip of tiles (375×72) placed under the navbar. */
export function GeoStrip({ className, opacity = 1 }: DecoratorProps) {
  return (
    <svg
      viewBox="0 0 375 72"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={clsx(svgBase, "h-auto w-full", className)}
    >
      <g opacity={opacity}>
        <path d="M0 0 H54 L18 72 H0 Z" className={C.sky} />
        <path
          d="M96 36 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z M111 36 a15 15 0 1 1 30 0 a15 15 0 1 1 -30 0 Z"
          fillRule="evenodd"
          className={C.coral}
        />
        <rect x="186" y="0" width="64" height="16" className={C.saffron} />
        <rect x="186" y="16" width="64" height="56" className={C.primary} />
        <rect x="262" y="8" width="56" height="64" className={C.coral} />
        <circle cx="290" cy="40" r="22" className={C.saffron} />
        <rect x="325" y="8" width="50" height="64" className={C.primary} />
        <circle cx="350" cy="40" r="18" className={C.sky} />
      </g>
    </svg>
  );
}

/**
 * Classic 4-knob jigsaw silhouette (viewBox 100×100 body + knobs).
 * Use for puzzle-style heroes; set color or clip a photo with it.
 */
export function PuzzlePiece({
  color = "primary",
  className,
  opacity = 1,
}: DecoratorProps & { color?: keyof typeof C }) {
  return (
    <svg
      width={140}
      height={140}
      viewBox="-20 -20 140 140"
      aria-hidden
      className={clsx(svgBase, className)}
    >
      <path
        opacity={opacity}
        className={C[color]}
        d="M0 0 H38 C38 -8 30 -12 30 -16 C30 -26 70 -26 70 -16 C70 -12 62 -8 62 0 H100 V38 C108 38 112 30 116 30 C126 30 126 70 116 70 C112 70 108 62 100 62 V100 H62 C62 92 70 88 70 84 C70 74 30 74 30 84 C30 88 38 92 38 100 H0 V62 C-8 62 -12 70 -16 70 C-26 70 -26 30 -16 30 C-12 30 -8 38 0 38 Z"
      />
    </svg>
  );
}

/** Pale dot-matrix backdrop (e.g. the events hero map). Fills its box. */
export function DotGrid({
  className,
  opacity = 0.2,
  gap = 14,
  radius = 2.4,
}: DecoratorProps & { gap?: number; radius?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg aria-hidden className={clsx(svgBase, "h-full w-full", className)}>
      <defs>
        <pattern id={`dots-${uid}`} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={gap / 2} cy={gap / 2} r={radius} className={C.primary} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dots-${uid})`} opacity={opacity} />
    </svg>
  );
}

/** 28px bullet glyph: coral bar, saffron triangle, teal triangles. */
export function GlyphBar({ className }: { className?: string }) {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden className={clsx(svgBase, className)}>
      <rect x="0" y="0" width="6" height="28" className={C.coral} />
      <path d="M8 0 H28 L8 20 Z" className={C.saffron} />
      <path d="M28 8 V28 H8 Z" className={C.primary} />
    </svg>
  );
}

/** 20px bullet glyph: coral bar, saffron triangle, sky square. */
export function GlyphMini({ className }: { className?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden className={clsx(svgBase, className)}>
      <rect x="0" y="0" width="4" height="20" className={C.coral} />
      <path d="M6 0 H20 L6 14 Z" className={C.saffron} />
      <rect x="12" y="12" width="8" height="8" className={C.sky} />
    </svg>
  );
}

/** 19px split-square emblem used in the floating CTA pill (coral + sky triangles). */
export function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19 19" aria-hidden className={clsx(svgBase, className)}>
      <path d="M0 19 L19 0 H0 Z" className={C.coral} />
      <path d="M0 0 L19 19 V0 Z" className={C.sky} />
    </svg>
  );
}
