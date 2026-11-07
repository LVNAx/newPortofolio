import clsx from "clsx";

/**
 * Non-WebGL neural core: CSS radial glow orb + a pre-computed SVG neural mesh
 * (same fibonacci-sphere + nearest-neighbour recipe as the 3D core, projected once).
 * Shown while three.js loads, when WebGL fails and for prefers-reduced-motion.
 */

const N = 120;
const R = 150;

function buildMesh() {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts: Array<[number, number, number]> = [];
  const ax = 0.42;
  const ay = 0.6;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * golden;
    let x = Math.cos(phi) * r;
    let z = Math.sin(phi) * r;
    let yy = y;
    // fixed tilt so the mesh reads as a sphere
    const x1 = x * Math.cos(ay) + z * Math.sin(ay);
    z = -x * Math.sin(ay) + z * Math.cos(ay);
    x = x1;
    const y1 = yy * Math.cos(ax) - z * Math.sin(ax);
    z = yy * Math.sin(ax) + z * Math.cos(ax);
    yy = y1;
    pts.push([x, yy, z]);
  }
  const edges: Array<[number, number]> = [];
  const seen = new Set<number>();
  for (let i = 0; i < N; i++) {
    const d = pts
      .map((p, j) => ({ j, d: j === i ? Infinity : (p[0] - pts[i][0]) ** 2 + (p[1] - pts[i][1]) ** 2 + (p[2] - pts[i][2]) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { j } of d) {
      const key = Math.min(i, j) * N + Math.max(i, j);
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  const f = (v: number) => Math.round(v * 10) / 10;
  return {
    nodes: pts.map(([x, y, z], i) => ({ x: f(x * R), y: f(-y * R), o: f(0.25 + ((z + 1) / 2) * 0.75), gold: i % 23 === 7, r: f(1.4 + ((z + 1) / 2) * 1.6) })),
    lines: edges.map(([a, b]) => ({
      x1: f(pts[a][0] * R),
      y1: f(-pts[a][1] * R),
      x2: f(pts[b][0] * R),
      y2: f(-pts[b][1] * R),
      o: f(0.06 + ((pts[a][2] + pts[b][2] + 2) / 4) * 0.3),
    })),
  };
}

const MESH = buildMesh();

export default function StaticCore({ className }: { className?: string }) {
  return (
    <div aria-hidden className={clsx("pointer-events-none relative h-[min(78vw,420px)] w-[min(78vw,420px)] lg:h-[460px] lg:w-[460px]", className)}>
      {/* glow orb */}
      <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(91,114,224,0.38)_0%,rgba(47,65,153,0.18)_35%,transparent_68%)]" />
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgba(94,230,255,0.55)_0%,rgba(79,139,255,0.18)_45%,transparent_72%)] blur-md motion-safe:animate-pulse" />
      {/* HUD rings */}
      <div className="absolute inset-[4%] rounded-full border border-dashed border-accent-cyan/25 [transform:rotateX(68deg)_rotateZ(12deg)]" />
      <div className="absolute inset-[-6%] rounded-full border border-dotted border-accent-sky/25 [transform:rotateX(72deg)_rotateZ(-18deg)]" />
      <svg viewBox="-180 -180 360 360" className="absolute inset-0 h-full w-full">
        <g strokeWidth={0.8} strokeLinecap="round">
          {MESH.lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#5EE6FF" strokeOpacity={l.o} />
          ))}
        </g>
        <g>
          {MESH.nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.gold ? "#F5C04A" : "#A9E9FF"} fillOpacity={n.o} />
          ))}
        </g>
        <circle r={10} fill="#ffffff" fillOpacity={0.85} />
        <circle r={26} fill="#5EE6FF" fillOpacity={0.18} />
      </svg>
    </div>
  );
}
