import { cn } from "@/lib/cn";
import { type ConstellationDef, projectConstellation } from "./constellations";

/** Round to 2 dp so server and client render identical attribute strings (trig differs in the last ulp). */
const q = (v: number) => Math.round(v * 100) / 100;
const starRadius = (mag: number, scale: number) => q(Math.max(0.9, (4.4 - mag) * 0.62) * scale);

/**
 * Flat SVG chart of a real constellation (tangent-plane projection, north up,
 * east left). Used as legend icons, in the achievement card and as the
 * no-WebGL backdrop. `draw` replays a stroke draw-in each time it mounts.
 */
export default function ConstellationGlyph({
  def,
  className,
  draw = false,
  scale = 1,
  tone = "gold",
  stroke = 0.8,
}: {
  def: ConstellationDef;
  className?: string;
  draw?: boolean;
  /** Multiplies star radii (use < 1 for tiny icons). */
  scale?: number;
  tone?: "gold" | "cool" | "muted";
  /** Line width in viewBox units (the box is 100 wide). */
  stroke?: number;
}) {
  const projected = projectConstellation(def, 100, 9);
  const lines = projected.lines;
  const points = projected.points.map((p) => ({ ...p, x: q(p.x), y: q(p.y) }));
  const n = Math.max(1, lines.length);
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("cosmos-glyph overflow-visible", `cosmos-glyph--${tone}`, draw && "cosmos-glyph--draw", className)}
    >
      <g className="cosmos-glyph__lines" fill="none" strokeLinecap="round" strokeWidth={stroke}>
        {lines.map(([a, b], k) => (
          <line
            key={k}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            pathLength={1}
            style={{ animationDelay: `${(k / n) * 0.9}s` }}
          />
        ))}
      </g>
      <g className="cosmos-glyph__stars">
        {points.map((p, k) => (
          <circle key={k} cx={p.x} cy={p.y} r={starRadius(p.mag, scale)} />
        ))}
      </g>
    </svg>
  );
}
