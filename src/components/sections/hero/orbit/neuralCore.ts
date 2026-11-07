/**
 * The AI "neural core" that replaces the BEM UI 3D logo at the centre of the orbit:
 * fibonacci-sphere neurons + nearest-neighbour synapses + a few deep arcs through the
 * interior, with shader-driven light pulses travelling along the edges, a dense inner
 * nucleus, a soft volumetric glow and two dashed HUD rings. Everything is additive.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
} from "three";

/** sRGB hex → raw vec3 (ShaderMaterials here write raw sRGB, no colour-space conversion). */
export const rgb = (hex: number): [number, number, number] => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];

export const CYAN = 0x5ee6ff;
export const SKY = 0x4f8bff;
export const GOLD = 0xf5c04a;
export const VIVID = 0x5b72e0;

export type NeuralCore = {
  group: Group;
  /** The part that spins (rings stay steadier). */
  spin: Group;
  update(t: number, dt: number): void;
  setPixelRatio(pr: number): void;
  dispose(): void;
  stats: { neurons: number; synapses: number };
};

function mulberry(seed: number) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- shaders ---------------- */

const POINT_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPR;
attribute float aSeed;
attribute float aScale;
varying float vSeed;
varying float vFire;
varying float vFacing;
void main() {
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vFacing = clamp((mv.z - c.z) / 1.6 * 0.5 + 0.5, 0.0, 1.0);
  float fire = pow(max(0.0, sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 61.0)), 28.0);
  vFire = fire;
  gl_PointSize = uSize * aScale * (1.0 + fire * 1.6) * uPR * (10.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const POINT_FRAG = /* glsl */ `
uniform vec3 uCyan;
uniform vec3 uSky;
uniform vec3 uGold;
uniform float uIntensity;
varying float vSeed;
varying float vFire;
varying float vFacing;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.18, 0.0, d);
  vec3 col = mix(uSky, uCyan, fract(vSeed * 7.31));
  col = mix(col, uGold, step(0.94, fract(vSeed * 3.17)));
  col = mix(col, vec3(1.0), core * 0.6 + vFire * 0.5);
  float depth = mix(0.35, 1.0, vFacing);
  float alpha = (a * 0.4 + core * 0.7) * depth * (0.6 + vFire * 1.6) * uIntensity;
  gl_FragColor = vec4(col * alpha, 1.0);
}`;

const EDGE_VERT = /* glsl */ `
attribute float aT;
attribute float aSeed;
attribute float aDeep;
varying float vT;
varying float vSeed;
varying float vDeep;
varying float vFacing;
void main() {
  vT = aT;
  vSeed = aSeed;
  vDeep = aDeep;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vFacing = clamp((mv.z - c.z) / 1.6 * 0.5 + 0.5, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const EDGE_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uSky;
uniform vec3 uGold;
uniform float uIntensity;
varying float vT;
varying float vSeed;
varying float vDeep;
varying float vFacing;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float speed = (0.18 + fract(vSeed * 13.7) * 0.42) * (1.0 + vDeep * 0.6);
  float cyc = uTime * speed + vSeed * 17.0;
  float head = fract(cyc);
  float id = floor(cyc);
  float isOn = step(0.62 - vDeep * 0.3, hash(id * 1.37 + vSeed * 91.7));
  // direction alternates per cycle so pulses flow both ways
  float t = mix(vT, 1.0 - vT, step(0.5, hash(id + vSeed * 7.0)));
  float x = head - t;
  float tail = x >= 0.0 ? pow(max(0.0, 1.0 - x / 0.28), 2.0) : 0.0;
  float spark = exp(-x * x * 900.0);
  float pulse = (tail * 0.7 + spark) * isOn;
  bool gold = fract(vSeed * 7.13) > 0.93;
  vec3 base = mix(uSky, uCyan, 0.35);
  vec3 pcol = gold ? uGold : mix(uCyan, vec3(1.0), spark * 0.6);
  float depth = mix(0.25, 1.0, vFacing);
  float baseA = (0.2 + vDeep * 0.08) * depth;
  vec3 col = base * baseA + pcol * pulse * depth * 1.1;
  gl_FragColor = vec4(col * uIntensity, 1.0);
}`;

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const GLOW_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uSky;
uniform float uBreath;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float halo = exp(-r * r * 7.0) * 0.26;
  float core = exp(-r * r * 60.0) * 0.55;
  float rim = exp(-pow((r - 0.42 - uBreath * 0.02) * 22.0, 2.0)) * 0.08;
  vec3 col = uSky * halo + mix(uCyan, vec3(1.0), 0.4) * core + uCyan * rim;
  gl_FragColor = vec4(col, 1.0);
}`;

const RING_VERT = /* glsl */ `
attribute float aA;
varying float vA;
void main() {
  vA = aA;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const RING_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uDash;
uniform float uSpeed;
uniform float uOpacity;
varying float vA;
void main() {
  float a = vA + uTime * uSpeed;
  float dash = step(0.45, fract(a * uDash));
  float sweep = pow(0.5 + 0.5 * sin(vA * 6.2831 - uTime * 0.9), 6.0);
  float alpha = (dash * 0.55 + sweep * 0.6) * uOpacity;
  gl_FragColor = vec4(uColor * alpha, 1.0);
}`;

/* ---------------- builder ---------------- */

export function createNeuralCore({ neurons = 420, radius = 1.55, pixelRatio = 1 }: { neurons?: number; radius?: number; pixelRatio?: number }): NeuralCore {
  const rand = mulberry(20260404);
  const disposables: Array<{ dispose(): void }> = [];
  const group = new Group();
  const spin = new Group();
  group.add(spin);

  const cyan = rgb(CYAN);
  const sky = rgb(SKY);
  const gold = rgb(GOLD);

  /* neurons on a fibonacci sphere (+ slight radial jitter) */
  const n = neurons;
  const pos = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * golden;
    const k = radius * (1 + (rand() - 0.5) * 0.12);
    pos[i * 3] = Math.cos(phi) * r * k;
    pos[i * 3 + 1] = y * k;
    pos[i * 3 + 2] = Math.sin(phi) * r * k;
  }

  /* synapses: k nearest neighbours (deduped) */
  const K = 3;
  const edgeKeys = new Set<number>();
  const edges: Array<[number, number]> = [];
  const dists = new Float32Array(n);
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      dists[j] = i === j ? Infinity : dx * dx + dy * dy + dz * dz;
      idx[j] = j;
    }
    // partial selection of the K smallest
    for (let a = 0; a < K; a++) {
      let best = a;
      for (let b = a + 1; b < n; b++) if (dists[idx[b]] < dists[idx[best]]) best = b;
      const tmp = idx[a];
      idx[a] = idx[best];
      idx[best] = tmp;
      const j = idx[a];
      const lo = Math.min(i, j);
      const hi = Math.max(i, j);
      const key = lo * n + hi;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        edges.push([lo, hi]);
      }
    }
  }

  const ePos: number[] = [];
  const eT: number[] = [];
  const eSeed: number[] = [];
  const eDeep: number[] = [];
  for (const [a, b] of edges) {
    const s = rand();
    ePos.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
    eT.push(0, 1);
    eSeed.push(s, s);
    eDeep.push(0, 0);
  }
  /* deep synapses: curved arcs through the interior between distant neurons */
  const ARCS = Math.round(n / 9);
  const SEGS = 14;
  for (let k = 0; k < ARCS; k++) {
    const a = Math.floor(rand() * n);
    const b = Math.floor(rand() * n);
    if (a === b) continue;
    const s = rand();
    const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
    const bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
    // control point pulled toward the centre
    const pull = 0.15 + rand() * 0.35;
    const mx = ((ax + bx) / 2) * pull, my = ((ay + by) / 2) * pull, mz = ((az + bz) / 2) * pull;
    let px = ax, py = ay, pz = az;
    for (let sgm = 1; sgm <= SEGS; sgm++) {
      const t = sgm / SEGS;
      const u = 1 - t;
      const qx = u * u * ax + 2 * u * t * mx + t * t * bx;
      const qy = u * u * ay + 2 * u * t * my + t * t * by;
      const qz = u * u * az + 2 * u * t * mz + t * t * bz;
      ePos.push(px, py, pz, qx, qy, qz);
      eT.push((sgm - 1) / SEGS, t);
      eSeed.push(s, s);
      eDeep.push(1, 1);
      px = qx; py = qy; pz = qz;
    }
  }

  const edgeGeo = new BufferGeometry();
  edgeGeo.setAttribute("position", new Float32BufferAttribute(ePos, 3));
  edgeGeo.setAttribute("aT", new Float32BufferAttribute(eT, 1));
  edgeGeo.setAttribute("aSeed", new Float32BufferAttribute(eSeed, 1));
  edgeGeo.setAttribute("aDeep", new Float32BufferAttribute(eDeep, 1));
  const edgeU = {
    uTime: { value: 0 },
    uCyan: { value: cyan },
    uSky: { value: sky },
    uGold: { value: gold },
    uIntensity: { value: 1 },
  };
  const edgeMat = new ShaderMaterial({
    uniforms: edgeU,
    vertexShader: EDGE_VERT,
    fragmentShader: EDGE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const edgeLines = new LineSegments(edgeGeo, edgeMat);
  edgeLines.renderOrder = 3;
  edgeLines.frustumCulled = false;
  spin.add(edgeLines);
  disposables.push(edgeGeo, edgeMat);

  /* neurons (+ dense nucleus) as points */
  const NUC = Math.round(n / 6);
  const allPos = new Float32Array((n + NUC) * 3);
  allPos.set(pos);
  const seeds = new Float32Array(n + NUC);
  const scales = new Float32Array(n + NUC);
  for (let i = 0; i < n; i++) {
    seeds[i] = rand();
    scales[i] = 0.7 + rand() * 0.8;
  }
  for (let i = 0; i < NUC; i++) {
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const r = Math.cbrt(rand()) * radius * 0.42;
    const s = Math.sqrt(1 - u * u);
    allPos[(n + i) * 3] = Math.cos(th) * s * r;
    allPos[(n + i) * 3 + 1] = u * r;
    allPos[(n + i) * 3 + 2] = Math.sin(th) * s * r;
    seeds[n + i] = rand();
    scales[n + i] = 0.45 + rand() * 0.5;
  }
  const pointGeo = new BufferGeometry();
  pointGeo.setAttribute("position", new Float32BufferAttribute(allPos, 3));
  pointGeo.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  pointGeo.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
  const pointU = {
    uTime: { value: 0 },
    uSize: { value: 3.4 },
    uPR: { value: pixelRatio },
    uCyan: { value: cyan },
    uSky: { value: sky },
    uGold: { value: gold },
    uIntensity: { value: 1 },
  };
  const pointMat = new ShaderMaterial({
    uniforms: pointU,
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(pointGeo, pointMat);
  points.renderOrder = 4;
  points.frustumCulled = false;
  spin.add(points);
  disposables.push(pointGeo, pointMat);

  /* volumetric glow (camera-facing plane; the camera never rotates) */
  const glowGeo = new PlaneGeometry(radius * 4.4, radius * 4.4);
  const glowU = { uTime: { value: 0 }, uCyan: { value: cyan }, uSky: { value: rgb(VIVID) }, uBreath: { value: 0 } };
  const glowMat = new ShaderMaterial({
    uniforms: glowU,
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const glow = new Mesh(glowGeo, glowMat);
  glow.renderOrder = 2;
  group.add(glow);
  disposables.push(glowGeo, glowMat);

  /* HUD rings */
  const rings: Array<{ mesh: LineSegments; mat: ShaderMaterial }> = [];
  const ring = (r: number, color: number, dash: number, speed: number, opacity: number, rx: number, rz: number) => {
    const SEG = 256;
    const p: number[] = [];
    const a: number[] = [];
    for (let i = 0; i < SEG; i++) {
      const t0 = i / SEG;
      const t1 = (i + 1) / SEG;
      p.push(Math.cos(t0 * Math.PI * 2) * r, 0, Math.sin(t0 * Math.PI * 2) * r, Math.cos(t1 * Math.PI * 2) * r, 0, Math.sin(t1 * Math.PI * 2) * r);
      a.push(t0, t1);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(p, 3));
    geo.setAttribute("aA", new Float32BufferAttribute(a, 1));
    const mat = new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: rgb(color) }, uDash: { value: dash }, uSpeed: { value: speed }, uOpacity: { value: opacity } },
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const mesh = new LineSegments(geo, mat);
    mesh.rotation.set(rx, 0, rz);
    mesh.renderOrder = 3;
    group.add(mesh);
    disposables.push(geo, mat);
    rings.push({ mesh, mat });
  };
  ring(radius * 1.42, CYAN, 64, 0.02, 0.55, 1.25, 0.18);
  ring(radius * 1.66, SKY, 120, -0.012, 0.4, 1.38, -0.32);
  ring(radius * 1.24, GOLD, 18, 0.05, 0.3, 1.1, 0.55);

  return {
    group,
    spin,
    stats: { neurons: n, synapses: edges.length + ARCS },
    update(t, dt) {
      edgeU.uTime.value = t;
      pointU.uTime.value = t;
      glowU.uTime.value = t;
      glowU.uBreath.value = Math.sin(t * 1.3);
      rings.forEach(({ mesh, mat }, i) => {
        mat.uniforms.uTime.value = t;
        mesh.rotation.y += dt * (i % 2 ? -0.08 : 0.06);
      });
    },
    setPixelRatio(pr) {
      pointU.uPR.value = pr;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
