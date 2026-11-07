import clsx from "clsx";
import { hashString, seeded } from "./utils";

/**
 * Deterministic hackvidia-style tile field (quarter circles, half discs,
 * triangles, rings, squares) on a square grid, painted in one accent
 * colour plus navy companions. Same `seed` -> same composition, so server
 * and client markup always match.
 */

type Shape = "quarter" | "half" | "tri" | "square" | "circle" | "ring" | "diamond" | "none";
const SHAPES: Shape[] = ["quarter", "quarter", "half", "tri", "square", "circle", "ring", "diamond", "none"];

export type TileFieldProps = {
  seed: string;
  accent: string;
  cols?: number;
  rows?: number;
  /** "dark" = on navy (cover); "light" = on light canvas (flagship backdrop). */
  tone?: "dark" | "light";
  /** Leave a fraction of cells empty (0..1). */
  density?: number;
  className?: string;
};

export function TileField({
  seed,
  accent,
  cols = 6,
  rows = 4,
  tone = "dark",
  density = 0.8,
  className,
}: TileFieldProps) {
  const rand = seeded(hashString(seed));
  const u = 100;
  const palette =
    tone === "dark"
      ? [accent, accent, "#5b72e0", "#2f4199", "#ffffff"]
      : [accent, accent, accent, "#2f4199", "#5b72e0"];

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const roll = rand();
      const shape = roll > density ? "none" : SHAPES[Math.floor(rand() * SHAPES.length)];
      const color = palette[Math.floor(rand() * palette.length)];
      const rot = [0, 90, 180, 270][Math.floor(rand() * 4)];
      const op =
        color === "#ffffff" ? 0.12 : tone === "dark" ? 0.55 + rand() * 0.45 : 0.7 + rand() * 0.3;
      const x = c * u;
      const y = r * u;
      const t = `rotate(${rot} ${x + u / 2} ${y + u / 2})`;
      const key = `${r}-${c}`;
      const common = { fill: color, opacity: op, transform: t };
      switch (shape) {
        case "quarter":
          cells.push(<path key={key} d={`M${x} ${y} H${x + u} A${u} ${u} 0 0 1 ${x} ${y + u} Z`} {...common} />);
          break;
        case "half":
          cells.push(<path key={key} d={`M${x} ${y + u} A${u / 2} ${u / 2} 0 0 1 ${x + u} ${y + u} Z`} {...common} />);
          break;
        case "tri":
          cells.push(<path key={key} d={`M${x} ${y} H${x + u} L${x} ${y + u} Z`} {...common} />);
          break;
        case "square":
          cells.push(<rect key={key} x={x} y={y} width={u} height={u} {...common} />);
          break;
        case "circle":
          cells.push(<circle key={key} cx={x + u / 2} cy={y + u / 2} r={u / 2 - 6} {...common} />);
          break;
        case "ring":
          cells.push(
            <circle
              key={key}
              cx={x + u / 2}
              cy={y + u / 2}
              r={u / 2 - 14}
              fill="none"
              stroke={color}
              strokeWidth={16}
              opacity={op}
            />,
          );
          break;
        case "diamond":
          cells.push(
            <path
              key={key}
              d={`M${x + u / 2} ${y} L${x + u} ${y + u / 2} L${x + u / 2} ${y + u} L${x} ${y + u / 2} Z`}
              {...common}
            />,
          );
          break;
        default:
          break;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols * u} ${rows * u}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={clsx("pointer-events-none select-none", className)}
    >
      {cells}
    </svg>
  );
}

/** Custom bullet glyph for highlights: rotating quarter-circle + square in the accent. */
export function HighlightGlyph({ accent, index }: { accent: string; index: number }) {
  const rot = [0, 90, 180, 270][index % 4];
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden className="mt-[3px] shrink-0">
      <rect x="0" y="0" width="18" height="18" rx="3" fill="#0b102d" />
      <path d="M2 2 H16 A14 14 0 0 1 2 16 Z" fill={accent} transform={`rotate(${rot} 9 9)`} />
      <rect x="11" y="11" width="5" height="5" fill="#ffffff" opacity={0.9} />
    </svg>
  );
}
