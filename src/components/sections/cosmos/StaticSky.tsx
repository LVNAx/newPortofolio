import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Static painterly night sky (pure SVG) — the poster frame shown before WebGL
 * is ready, and the full backdrop for no-WebGL / prefers-reduced-motion.
 * Generated once at module load from a seeded PRNG so SSR and client agree.
 */

const W = 1600;
const H = 1000;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

const STROKE_COLORS = ["#2f4199", "#2f4199", "#263580", "#4f8bff", "#5b72e0", "#5ee6ff"];

type Stroke = { d: string; color: string; width: number; opacity: number; dash: string; offset: number };

const SWIRLS: [number, number, number, number][] = [
  // cx, cy, radius, direction
  [600, 360, 175, 1],
  [1060, 250, 120, -1],
  [280, 700, 105, -1],
  [1330, 690, 135, 1],
];

const MOON = { x: 1385, y: 165, r: 46 };

const HALOS: [number, number, number][] = [
  [1180, 470, 1],
  [430, 230, 0.8],
  [880, 610, 0.9],
  [180, 420, 0.65],
  [1500, 420, 0.6],
  [720, 880, 0.55],
];

const sky = (() => {
  const rand = mulberry32(73019);
  const strokes: Stroke[] = [];

  // Wind: long wavy bands across the canvas, bent around the swirls.
  for (let y = 40; y < H + 40; y += 38) {
    const phase = rand() * Math.PI * 2;
    const amp = 10 + rand() * 18;
    const pts: string[] = [];
    for (let x = -60; x <= W + 60; x += 32) {
      let yy = y + Math.sin(x * 0.0042 + phase) * amp + Math.sin(x * 0.011 + phase * 2) * 4;
      for (const [cx, cy, r] of SWIRLS) {
        const dx = x - cx;
        const dy = yy - cy;
        const d = Math.hypot(dx, dy);
        if (d < r * 1.9) {
          const push = (1 - d / (r * 1.9)) * r * 0.55;
          yy += (dy >= 0 ? 1 : -1) * push;
        }
      }
      pts.push(`${r1(x)} ${r1(yy)}`);
    }
    strokes.push({
      d: `M${pts.join(" L")}`,
      color: STROKE_COLORS[Math.floor(rand() * STROKE_COLORS.length)],
      width: 5 + rand() * 6,
      opacity: 0.18 + rand() * 0.22,
      dash: `${r1(40 + rand() * 60)} ${r1(14 + rand() * 18)}`,
      offset: r1(rand() * 100),
    });
  }

  // Swirls: broken spiral arcs.
  for (const [cx, cy, R, dir] of SWIRLS) {
    for (let k = 1; k <= 8; k++) {
      const base = (k / 8) * R;
      const segs = 2 + Math.floor(rand() * 3);
      let a = rand() * Math.PI * 2;
      for (let s = 0; s < segs; s++) {
        const len = (Math.PI * 2) / segs - 0.35 - rand() * 0.3;
        const pts: string[] = [];
        for (let i = 0; i <= 14; i++) {
          const t = i / 14;
          const ang = a + dir * len * t;
          const rr = base * (1 + 0.14 * t);
          pts.push(`${r1(cx + Math.cos(ang) * rr)} ${r1(cy + Math.sin(ang) * rr * 0.86)}`);
        }
        strokes.push({
          d: `M${pts.join(" L")}`,
          color: k > 6 ? "#5ee6ff" : STROKE_COLORS[Math.floor(rand() * STROKE_COLORS.length)],
          width: 4 + rand() * 5,
          opacity: 0.22 + rand() * 0.25,
          dash: `${r1(26 + rand() * 30)} ${r1(8 + rand() * 10)}`,
          offset: r1(rand() * 50),
        });
        a += dir * (len + 0.35);
      }
    }
  }

  const stars = Array.from({ length: 230 }, () => {
    const big = rand() < 0.08;
    return {
      x: r1(rand() * W),
      y: r1(rand() * H),
      r: r1(big ? 1.8 + rand() * 1.6 : 0.6 + rand() * 1.1),
      o: r1(0.35 + rand() * 0.6),
      warm: rand() < 0.2,
    };
  });

  return { strokes, stars };
})();

export default function StaticSky({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const bg = `cs-bg-${uid}`;
  const halo = `cs-halo-${uid}`;
  const moonMask = `cs-moon-${uid}`;
  const mw = `cs-mw-${uid}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn("pointer-events-none block h-full w-full select-none", className)}
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05081a" />
          <stop offset="0.55" stopColor="#0b102d" />
          <stop offset="1" stopColor="#141d48" />
        </linearGradient>
        <radialGradient id={halo}>
          <stop offset="0" stopColor="#fff4d6" stopOpacity="0.95" />
          <stop offset="0.18" stopColor="#f5c04a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f5c04a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={mw} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a9c6ff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a9c6ff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#a9c6ff" stopOpacity="0" />
        </linearGradient>
        <mask id={moonMask}>
          <rect width={W} height={H} fill="black" />
          <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="white" />
          <circle cx={MOON.x - 20} cy={MOON.y - 12} r={MOON.r * 0.9} fill="black" />
        </mask>
      </defs>

      <rect width={W} height={H} fill={`url(#${bg})`} />
      <path d={`M-100 ${H * 0.95} Q ${W * 0.45} ${H * 0.35} ${W + 100} ${H * 0.05}`} stroke={`url(#${mw})`} strokeWidth="230" fill="none" />

      <g fill="none" strokeLinecap="round">
        {sky.strokes.map((s, i) => (
          <path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeOpacity={s.opacity} strokeDasharray={s.dash} strokeDashoffset={s.offset} />
        ))}
      </g>

      {sky.stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.warm ? "#ffe3a3" : "#dfe8ff"} opacity={s.o} />
      ))}

      {HALOS.map(([x, y, k], i) => (
        <g key={i} opacity={k}>
          <circle cx={x} cy={y} r={70} fill={`url(#${halo})`} />
          {[18, 30, 43, 57].map((r, j) => (
            <circle key={j} cx={x} cy={y} r={r} fill="none" stroke="#f5c04a" strokeOpacity={0.32 - j * 0.06} strokeWidth={3} strokeDasharray="14 8" />
          ))}
          <circle cx={x} cy={y} r={4} fill="#fff4d6" />
        </g>
      ))}

      <g>
        <circle cx={MOON.x} cy={MOON.y} r={150} fill={`url(#${halo})`} opacity={0.45} />
        {[70, 92, 116].map((r, j) => (
          <circle key={j} cx={MOON.x} cy={MOON.y} r={r} fill="none" stroke="#f5c04a" strokeOpacity={0.28 - j * 0.07} strokeWidth={4} strokeDasharray="22 10" />
        ))}
        <rect width={W} height={H} fill="#ffe3a3" mask={`url(#${moonMask})`} />
      </g>
    </svg>
  );
}
