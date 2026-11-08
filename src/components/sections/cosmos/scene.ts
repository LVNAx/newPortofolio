/**
 * Cosmos WebGL scene — the viewer stands at the centre of a celestial sphere.
 *
 * Layers (outer → inner):
 *   r=100  painterly sky dome (flow-field shader, Milky Way, swirl halos, moon)
 *   r=85   faint star shell
 *   r=75   nebulae / galaxies at their real positions
 *   r=60   constellation stars + bright landmark stars + constellation lines
 *   r=48   mid star shell
 *   r=28   sparse near shell (strongest parallax)
 *   r=50   occasional meteor
 *
 * One renderer, DPR capped (and lowered adaptively if frames are slow), render
 * loop paused off-screen / when the tab is hidden, everything disposed on
 * teardown. Pointer input: drag rotates (with inertia), wheel is never touched.
 * On touch the stage uses `touch-action: pan-y` and only horizontal-dominant
 * drags rotate, so vertical swipes keep scrolling the page.
 */
import * as THREE from "three";
import { type ConstellationDef, centroidOf, formatRaDec, raDecToVec } from "./constellations";
import {
  C_STAR_FRAG,
  LINE_FRAG,
  METEOR_FRAG,
  METEOR_VERT,
  NEBULA_FRAG,
  NEBULA_VERT,
  SKY_VERT,
  STARS_FRAG,
  STARS_VERT,
  cStarVert,
  lineVert,
  skyFrag,
} from "./shaders";

export type CosmosApi = {
  /** Swing the camera (quaternion slerp) to constellation `i` and draw it in. */
  focus(i: number, duration?: number): void;
  /** Highlight from outside the canvas (e.g. hovering the HTML legend). */
  setHover(i: number | null): void;
  dispose(): void;
};

export type CosmosOptions = {
  /** Section-sized element receiving pointer input. */
  stage: HTMLElement;
  /** Element that hosts the canvas (sticky, viewport-sized). */
  viewport: HTMLElement;
  constellations: ConstellationDef[];
  labels: (HTMLElement | null)[];
  /** Reticle root; its children with [data-corner] are positioned each frame, [data-tag] gets the name. */
  reticle: HTMLElement | null;
  /** Optional readout of the current view centre (RA/Dec). */
  readout: HTMLElement | null;
  initialFocus: number;
  onHover(i: number | null): void;
  onSelect(i: number): void;
  onInteract(): void;
};

/* --------------------------- constants --------------------------- */

const R_CONST = 60;
const R_NEBULA = 75;
const R_METEOR = 50;
const PITCH_LIMIT = 1.22;
const DEG = Math.PI / 180;

/** Galactic north pole (J2000): RA 12h 51.4m, Dec +27.13°. */
const GAL_POLE = raDecToVec(12.857, 27.13);

/** The brightest stars of the sky that are not part of our figures — landmarks with halos. */
const LANDMARKS: { name: string; ra: number; dec: number; mag: number }[] = [
  { name: "Sirius", ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { name: "Canopus", ra: 6.3992, dec: -52.6957, mag: -0.74 },
  { name: "Rigil Kentaurus", ra: 14.6599, dec: -60.8354, mag: -0.27 },
  { name: "Arcturus", ra: 14.261, dec: 19.1825, mag: -0.05 },
  { name: "Capella", ra: 5.2782, dec: 45.998, mag: 0.08 },
  { name: "Procyon", ra: 7.655, dec: 5.225, mag: 0.34 },
  { name: "Achernar", ra: 1.6286, dec: -57.2368, mag: 0.46 },
  { name: "Hadar", ra: 14.0637, dec: -60.373, mag: 0.61 },
  { name: "Aldebaran", ra: 4.5987, dec: 16.5093, mag: 0.85 },
  { name: "Spica", ra: 13.4199, dec: -11.1613, mag: 0.97 },
  { name: "Fomalhaut", ra: 22.9608, dec: -29.6222, mag: 1.16 },
  { name: "Polaris", ra: 2.5303, dec: 89.2641, mag: 1.98 },
];

/** Deep-sky objects at their real positions. */
const NEBULAE: { ra: number; dec: number; size: number; stretch?: number; c1: number; c2: number; o: number }[] = [
  { ra: 5.588, dec: -5.39, size: 7, c1: 0xd64c6f, c2: 0x5ee6ff, o: 0.55 }, // M42 Orion Nebula
  { ra: 10.75, dec: -59.7, size: 11, c1: 0xd64c6f, c2: 0xf5c04a, o: 0.42 }, // Carina Nebula
  { ra: 16.43, dec: -23.45, size: 15, c1: 0xf5c04a, c2: 0x4f8bff, o: 0.3 }, // ρ Ophiuchi clouds
  { ra: 20.98, dec: 44.33, size: 10, c1: 0xd64c6f, c2: 0x5b72e0, o: 0.36 }, // North America Nebula
  { ra: 3.79, dec: 24.1, size: 7, c1: 0x4f8bff, c2: 0xa9c6ff, o: 0.5 }, // Pleiades reflection
  { ra: 5.39, dec: -69.76, size: 16, c1: 0x9cb3d3, c2: 0xfff4d6, o: 0.32 }, // Large Magellanic Cloud
  { ra: 0.712, dec: 41.27, size: 9, stretch: 2.6, c1: 0xfff4d6, c2: 0x5b72e0, o: 0.42 }, // Andromeda (M31)
];

/** Swirl centres for the painterly sky (direction + twist in radians). */
const VORTICES: [number, number, number][] = [
  [6.9, 14, 3.3],
  [4.5, -13, -2.6],
  [12.5, 25, 3.0],
  [17.6, -10, -2.8],
];

/** Crescent moon, placed near the ecliptic in Taurus. */
const MOON = raDecToVec(3.35, 17.5);

const HALO_SLOTS = 28;

/* --------------------------- helpers --------------------------- */

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

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function magToSize(mag: number) {
  return clamp(30 - mag * 6.2, 9, 40);
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Slerp-free great-circle point between unit vectors a and b at fraction t (they are close). */
function nlerp(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  return out.copy(a).lerp(b, t).normalize();
}

/* --------------------------- scene --------------------------- */

export function createCosmos(opts: CosmosOptions): CosmosApi | null {
  if (!webglAvailable()) return null;

  const { stage, viewport, constellations } = opts;
  const N = constellations.length;
  const SLOTS = N + 1; // last slot = "not a constellation" (always 0)

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setClearColor(0x05081a, 1);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.setAttribute("aria-hidden", "true");
  viewport.appendChild(canvas);

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  let dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  camera.rotation.order = "YXZ";

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(o: T) => {
    disposables.push(o);
    return o;
  };

  const rand = mulberry32(20240617);

  /* ---------- shared uniforms ---------- */
  const uTime = { value: 0 };
  const uResolution = { value: new THREE.Vector2(1, 1) };
  const uScale = { value: 1 };
  const uActive = { value: new Array<number>(SLOTS).fill(0) };
  const uProgress = { value: new Array<number>(SLOTS).fill(0) };

  /* ---------- sky dome ---------- */
  const haloStars: { dir: THREE.Vector3; base: number; idx: number }[] = [];
  constellations.forEach((c, ci) => {
    c.stars.forEach((s) => {
      if (s.mag < 1.9) {
        haloStars.push({ dir: new THREE.Vector3(...raDecToVec(s.ra, s.dec)), base: clamp((2.2 - s.mag) / 2.2, 0.45, 1), idx: ci });
      }
    });
  });
  for (const l of LANDMARKS) {
    if (l.mag < 1.0) haloStars.push({ dir: new THREE.Vector3(...raDecToVec(l.ra, l.dec)), base: clamp((2.1 - l.mag) / 2.4, 0.3, 1.25), idx: N });
  }
  haloStars.sort((a, b) => b.base - a.base);
  haloStars.length = Math.min(haloStars.length, HALO_SLOTS);
  const haloUniform = Array.from({ length: HALO_SLOTS }, (_, i) => {
    const h = haloStars[i];
    return h ? new THREE.Vector4(h.dir.x, h.dir.y, h.dir.z, h.base) : new THREE.Vector4(0, 1, 0, 0);
  });

  /* Bake the expensive painterly field once into a cubemap (it barely moved
     anyway), so each frame only samples a texture + draws halos/moon. */
  const bakeSize = coarse || Math.min(screen.width, screen.height) < 900 ? 512 : 1024;
  const skyTarget = track(new THREE.WebGLCubeRenderTarget(bakeSize, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter }));
  {
    const vortex = VORTICES.map(([ra, dec, w]) => {
      const v = raDecToVec(ra, dec);
      return new THREE.Vector4(v[0], v[1], v[2], w);
    });
    const bakeMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: skyFrag(HALO_SLOTS, VORTICES.length, true),
      uniforms: {
        uTime: { value: 0 },
        uSkyMap: { value: null },
        uHalos: { value: haloUniform },
        uVortex: { value: vortex },
        uMoon: { value: new THREE.Vector3(...MOON) },
        uGalPole: { value: new THREE.Vector3(...GAL_POLE) },
      },
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });
    const bakeGeo = new THREE.SphereGeometry(100, 64, 32);
    const bakeScene = new THREE.Scene();
    bakeScene.add(new THREE.Mesh(bakeGeo, bakeMat));
    const cubeCam = new THREE.CubeCamera(0.1, 400, skyTarget);
    cubeCam.update(renderer, bakeScene);
    bakeGeo.dispose();
    bakeMat.dispose();
  }

  const skyMat = track(
    new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: skyFrag(HALO_SLOTS, VORTICES.length),
      uniforms: {
        uSkyMap: { value: skyTarget.texture },
        uTime,
        uHalos: { value: haloUniform },
        uVortex: {
          value: VORTICES.map(([ra, dec, w]) => {
            const v = raDecToVec(ra, dec);
            return new THREE.Vector4(v[0], v[1], v[2], w);
          }),
        },
        uMoon: { value: new THREE.Vector3(...MOON) },
        uGalPole: { value: new THREE.Vector3(...GAL_POLE) },
      },
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    }),
  );
  const skyGeo = track(new THREE.SphereGeometry(100, 48, 24));
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  /* ---------- background star shells ---------- */
  const galPole = new THREE.Vector3(...GAL_POLE);
  const starMat = track(
    new THREE.ShaderMaterial({
      vertexShader: STARS_VERT,
      fragmentShader: STARS_FRAG,
      uniforms: { uTime, uScale, uTwinkle: { value: 1 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const shellCounts = coarse ? [140, 1100, 1300] : [220, 1900, 2400];
  const shells: [number, number, number, number][] = [
    // radius, count, minSize, maxSize
    [28, shellCounts[0], 1.2, 3.0],
    [48, shellCounts[1], 1.6, 4.4],
    [85, shellCounts[2], 2.2, 5.6],
  ];
  const tmp = new THREE.Vector3();
  for (const [radius, count, minS, maxS] of shells) {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // uniform direction
      const u = rand() * 2 - 1;
      const th = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      tmp.set(s * Math.cos(th), u, s * Math.sin(th));
      // ~45% are pulled toward the galactic plane (Milky Way density)
      if (rand() < 0.45) {
        const g = tmp.dot(galPole);
        tmp.addScaledVector(galPole, -g * (0.75 + rand() * 0.22)).normalize();
      }
      pos[i * 3] = tmp.x * radius;
      pos[i * 3 + 1] = tmp.y * radius;
      pos[i * 3 + 2] = tmp.z * radius;
      size[i] = minS + (maxS - minS) * Math.pow(rand(), 3.2);
      const k = rand();
      const c =
        k < 0.68 ? [0.8, 0.86, 1.0] : k < 0.84 ? [1.0, 0.95, 0.82] : k < 0.94 ? [1.0, 0.82, 0.55] : [0.55, 0.85, 1.0];
      const b = 0.65 + rand() * 0.5;
      color[i * 3] = c[0] * b;
      color[i * 3 + 1] = c[1] * b;
      color[i * 3 + 2] = c[2] * b;
      phase[i] = rand();
    }
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const pts = new THREE.Points(geo, starMat);
    pts.frustumCulled = false;
    scene.add(pts);
  }

  /* ---------- nebulae & galaxies ---------- */
  const nebulaGeo = track(new THREE.PlaneGeometry(1, 1));
  NEBULAE.forEach((n, i) => {
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT,
        fragmentShader: NEBULA_FRAG,
        uniforms: {
          uTime,
          // Colours are authored in sRGB: store the raw hex values, no colour management.
          uColor: { value: new THREE.Color().setHex(n.c1, THREE.LinearSRGBColorSpace) },
          uColor2: { value: new THREE.Color().setHex(n.c2, THREE.LinearSRGBColorSpace) },
          uOpacity: { value: n.o },
          uSeed: { value: i * 7.31 + 1.7 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    const m = new THREE.Mesh(nebulaGeo, mat);
    const d = raDecToVec(n.ra, n.dec);
    m.position.set(d[0] * R_NEBULA, d[1] * R_NEBULA, d[2] * R_NEBULA);
    m.lookAt(0, 0, 0);
    m.rotateZ(rand() * Math.PI);
    m.scale.set(n.size * (n.stretch ?? 1), n.size, 1);
    m.renderOrder = -5;
    m.frustumCulled = false;
    scene.add(m);
  });

  /* ---------- constellation & landmark stars ---------- */
  type CData = {
    starPos: THREE.Vector3[];
    centroid: THREE.Vector3;
    segs: [number, number][];
    /** screen space: x, y, visible (1/0) */
    screen: Float32Array;
    box: { x0: number; y0: number; x1: number; y1: number; vis: number };
  };
  const cdata: CData[] = constellations.map((c) => {
    const idx = new Map(c.stars.map((s, i) => [s.id, i]));
    const starPos = c.stars.map((s) => new THREE.Vector3(...raDecToVec(s.ra, s.dec)).multiplyScalar(R_CONST));
    const segs = c.lines
      .map(([a, b]) => [idx.get(a), idx.get(b)] as [number | undefined, number | undefined])
      .filter((s): s is [number, number] => s[0] !== undefined && s[1] !== undefined);
    return {
      starPos,
      centroid: new THREE.Vector3(...centroidOf(c)),
      segs,
      screen: new Float32Array(c.stars.length * 3),
      box: { x0: 0, y0: 0, x1: 0, y1: 0, vis: 0 },
    };
  });

  {
    const all: { p: THREE.Vector3; mag: number; idx: number }[] = [];
    cdata.forEach((c, ci) => c.starPos.forEach((p, si) => all.push({ p, mag: constellations[ci].stars[si].mag, idx: ci })));
    for (const l of LANDMARKS) {
      all.push({ p: new THREE.Vector3(...raDecToVec(l.ra, l.dec)).multiplyScalar(R_CONST), mag: l.mag, idx: N });
    }
    const n = all.length;
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const idx = new Float32Array(n);
    const seed = new Float32Array(n);
    all.forEach((s, i) => {
      pos[i * 3] = s.p.x;
      pos[i * 3 + 1] = s.p.y;
      pos[i * 3 + 2] = s.p.z;
      size[i] = magToSize(s.mag);
      idx[i] = s.idx;
      seed[i] = rand();
    });
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: cStarVert(SLOTS),
        fragmentShader: C_STAR_FRAG,
        uniforms: { uTime, uScale, uActive },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    scene.add(pts);
  }

  /* ---------- constellation lines (ribbons) ---------- */
  let lineWidth: { value: number } | null = null;
  {
    const verts: number[] = [];
    const aStart: number[] = [];
    const aEnd: number[] = [];
    const aSide: number[] = [];
    const aT: number[] = [];
    const aIdx: number[] = [];
    const aS0: number[] = [];
    const aS1: number[] = [];
    const aLen: number[] = [];
    const A = new THREE.Vector3();
    const B = new THREE.Vector3();
    const tA = new THREE.Vector3();
    const tB = new THREE.Vector3();
    cdata.forEach((c, ci) => {
      const n = c.segs.length;
      c.segs.forEach(([ia, ib], k) => {
        A.copy(c.starPos[ia]).normalize();
        B.copy(c.starPos[ib]).normalize();
        const ang = A.angleTo(B);
        const gap = Math.min(0.38, (1.1 * DEG) / Math.max(ang, 1e-4));
        nlerp(A, B, gap, tA).multiplyScalar(R_CONST);
        nlerp(A, B, 1 - gap, tB).multiplyScalar(R_CONST);
        const dashes = Math.max(2, Math.round(ang / DEG / 0.9));
        // two triangles: (0,-1) (1,-1) (1,1) / (0,-1) (1,1) (0,1)
        const corners: [number, number][] = [
          [0, -1],
          [1, -1],
          [1, 1],
          [0, -1],
          [1, 1],
          [0, 1],
        ];
        for (const [t, side] of corners) {
          const p = t === 0 ? tA : tB;
          verts.push(p.x, p.y, p.z);
          aStart.push(tA.x, tA.y, tA.z);
          aEnd.push(tB.x, tB.y, tB.z);
          aSide.push(side);
          aT.push(t);
          aIdx.push(ci);
          aS0.push(k / n);
          aS1.push((k + 1) / n);
          aLen.push(dashes);
        }
      });
    });
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("aStart", new THREE.Float32BufferAttribute(aStart, 3));
    geo.setAttribute("aEnd", new THREE.Float32BufferAttribute(aEnd, 3));
    geo.setAttribute("aSide", new THREE.Float32BufferAttribute(aSide, 1));
    geo.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
    geo.setAttribute("aIdx", new THREE.Float32BufferAttribute(aIdx, 1));
    geo.setAttribute("aS0", new THREE.Float32BufferAttribute(aS0, 1));
    geo.setAttribute("aS1", new THREE.Float32BufferAttribute(aS1, 1));
    geo.setAttribute("aLen", new THREE.Float32BufferAttribute(aLen, 1));
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: lineVert(SLOTS),
        fragmentShader: LINE_FRAG,
        uniforms: { uTime, uResolution, uWidth: { value: 1 }, uActive, uProgress },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    scene.add(mesh);
    lineWidth = mat.uniforms.uWidth;
  }

  /* ---------- meteor ---------- */
  const meteorUniforms = {
    uA: { value: new THREE.Vector3() },
    uB: { value: new THREE.Vector3() },
    uResolution,
    uWidth: { value: 1.4 },
    uFade: { value: 0 },
  };
  {
    const geo = track(new THREE.BufferGeometry());
    const corners: [number, number][] = [
      [0, -1],
      [1, -1],
      [1, 1],
      [0, -1],
      [1, 1],
      [0, 1],
    ];
    geo.setAttribute("position", new THREE.Float32BufferAttribute(new Array(18).fill(0), 3));
    geo.setAttribute("aT", new THREE.Float32BufferAttribute(corners.map((c) => c[0]), 1));
    geo.setAttribute("aSide", new THREE.Float32BufferAttribute(corners.map((c) => c[1]), 1));
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: METEOR_VERT,
        fragmentShader: METEOR_FRAG,
        uniforms: meteorUniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    scene.add(mesh);
  }
  const meteor = {
    active: false,
    t: 0,
    life: 0.85,
    next: 4 + rand() * 5,
    dir0: new THREE.Vector3(),
    axis: new THREE.Vector3(),
    sweep: 0.36,
  };

  /* --------------------------- camera state --------------------------- */

  const dirToYawPitch = (d: THREE.Vector3) => ({
    yaw: Math.atan2(-d.x, -d.z),
    pitch: Math.asin(clamp(d.y, -1, 1)),
  });

  let yaw = 0;
  let pitch = 0;
  let yawVel = 0;
  let pitchVel = 0;
  let baseFov = 55;
  let fovOffset = 0;
  {
    // Start a little off the first target so the intro can swing into it.
    const target = dirToYawPitch(cdata[clamp(opts.initialFocus, 0, N - 1)].centroid);
    yaw = target.yaw - 0.95;
    pitch = clamp(target.pitch - 0.32, -PITCH_LIMIT, PITCH_LIMIT);
    fovOffset = 16;
  }

  const qTmp = new THREE.Quaternion();
  const eTmp = new THREE.Euler(0, 0, 0, "YXZ");
  const tween = {
    active: false,
    t: 0,
    dur: 1.6,
    from: new THREE.Quaternion(),
    to: new THREE.Quaternion(),
    fovFrom: 0,
    fovTo: 0,
  };

  let focused = clamp(opts.initialFocus, 0, N - 1);
  let canvasHover: number | null = null;
  let externalHover: number | null = null;
  let lastIdle = performance.now();
  let introDone = false;

  /* --------------------------- sizing --------------------------- */

  let cssW = 1;
  let cssH = 1;
  const applySize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssW, cssH, false);
    camera.aspect = cssW / cssH;
    const a = camera.aspect;
    baseFov = a < 0.8 ? 74 : a < 1.25 ? 62 : 54;
    if (cssW >= 1024) {
      // Push the look-at point right of centre so the copy column never covers the target.
      camera.setViewOffset(cssW, cssH, -cssW * 0.13, 0, cssW, cssH);
    } else {
      camera.clearViewOffset();
    }
    camera.fov = baseFov + fovOffset;
    camera.updateProjectionMatrix();
    uResolution.value.set(cssW * dpr, cssH * dpr);
    uScale.value = dpr * clamp(cssH / 900, 0.72, 1.25);
    if (lineWidth) lineWidth.value = 0.9 * dpr;
    meteorUniforms.uWidth.value = 1.3 * dpr;
  };
  const measure = () => {
    const r = viewport.getBoundingClientRect();
    cssW = Math.max(1, Math.round(r.width));
    cssH = Math.max(1, Math.round(r.height));
    applySize();
  };
  measure();
  const ro = new ResizeObserver(() => {
    measure();
    if (!running) renderOnce();
  });
  ro.observe(viewport);

  /* --------------------------- input --------------------------- */

  type Drag = { id: number; x0: number; y0: number; lx: number; ly: number; lt: number; mode: "pending" | "rotate" | "scroll"; moved: number; touch: boolean };
  let drag: Drag | null = null;
  const pointer = { x: 0, y: 0, inside: false, nx: 0, ny: 0 };
  const parallax = { x: 0, y: 0 };

  const localPoint = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const setCursor = (c: string) => {
    if (stage.style.cursor !== c) stage.style.cursor = c;
  };

  let interacted = false;
  const markInteract = () => {
    lastIdle = performance.now();
    if (!interacted) {
      interacted = true;
      opts.onInteract();
    }
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const p = localPoint(e);
    const touch = e.pointerType !== "mouse";
    drag = { id: e.pointerId, x0: p.x, y0: p.y, lx: p.x, ly: p.y, lt: performance.now(), mode: touch ? "pending" : "rotate", moved: 0, touch };
    if (!touch) {
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    yawVel = 0;
    pitchVel = 0;
    lastIdle = performance.now();
  };

  const onMove = (e: PointerEvent) => {
    const p = localPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = e.pointerType === "mouse";
    pointer.nx = clamp((p.x / cssW) * 2 - 1, -1, 1);
    pointer.ny = clamp((p.y / cssH) * 2 - 1, -1, 1);
    if (!drag || e.pointerId !== drag.id) return;
    const dx = p.x - drag.lx;
    const dy = p.y - drag.ly;
    drag.moved = Math.max(drag.moved, Math.hypot(p.x - drag.x0, p.y - drag.y0));
    if (drag.mode === "pending") {
      const tx = p.x - drag.x0;
      const ty = p.y - drag.y0;
      if (Math.abs(tx) + Math.abs(ty) > 8) {
        if (Math.abs(tx) > Math.abs(ty) * 1.15) {
          drag.mode = "rotate";
          try {
            stage.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        } else {
          drag.mode = "scroll";
        }
      }
      drag.lx = p.x;
      drag.ly = p.y;
      return;
    }
    if (drag.mode !== "rotate") return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lt) / 1000;
    const k = (camera.fov * DEG) / cssH;
    const dYaw = dx * k;
    const dPitch = dy * k * (drag.touch ? 0.6 : 1);
    if (tween.active) {
      tween.active = false;
      syncFromCamera();
    }
    yaw += dYaw;
    pitch = clamp(pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT);
    yawVel = yawVel * 0.4 + (dYaw / dt) * 0.6;
    pitchVel = pitchVel * 0.4 + (dPitch / dt) * 0.6;
    drag.lx = p.x;
    drag.ly = p.y;
    drag.lt = now;
    if (drag.moved > 4) {
      setCursor("grabbing");
      markInteract();
    }
  };

  const endDrag = (e: PointerEvent, cancelled: boolean) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    try {
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    // Inertia only if the pointer was still moving when released.
    if (performance.now() - d.lt > 80 || d.mode !== "rotate") {
      yawVel = 0;
      pitchVel = 0;
    }
    yawVel = clamp(yawVel, -3, 3);
    pitchVel = clamp(pitchVel, -2, 2);
    setCursor("grab");
    if (!cancelled && d.moved < 6 && d.mode !== "scroll") {
      const p = localPoint(e);
      const hit = hitTest(p.x, p.y, d.touch ? 34 : 24);
      if (hit !== null) {
        markInteract();
        opts.onSelect(hit);
      }
    }
    lastIdle = performance.now();
  };
  const onUp = (e: PointerEvent) => endDrag(e, false);
  const onCancel = (e: PointerEvent) => endDrag(e, true);
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") pointer.inside = false;
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onCancel);
  stage.addEventListener("pointerleave", onLeave);
  setCursor("grab");

  /* --------------------------- projection & hit test --------------------------- */

  const vp = new THREE.Matrix4();
  const projectAll = () => {
    vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const e = vp.elements;
    for (const c of cdata) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let vis = 0;
      c.starPos.forEach((p, i) => {
        const w = e[3] * p.x + e[7] * p.y + e[11] * p.z + e[15];
        const o = i * 3;
        if (w <= 0.01) {
          c.screen[o + 2] = 0;
          return;
        }
        const nx = (e[0] * p.x + e[4] * p.y + e[8] * p.z + e[12]) / w;
        const ny = (e[1] * p.x + e[5] * p.y + e[9] * p.z + e[13]) / w;
        const sx = (nx * 0.5 + 0.5) * cssW;
        const sy = (0.5 - ny * 0.5) * cssH;
        c.screen[o] = sx;
        c.screen[o + 1] = sy;
        c.screen[o + 2] = 1;
        vis++;
        x0 = Math.min(x0, sx);
        y0 = Math.min(y0, sy);
        x1 = Math.max(x1, sx);
        y1 = Math.max(y1, sy);
      });
      c.box.x0 = x0;
      c.box.y0 = y0;
      c.box.x1 = x1;
      c.box.y1 = y1;
      c.box.vis = vis / c.starPos.length;
    }
  };

  const distToSeg = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const vx = bx - ax;
    const vy = by - ay;
    const l2 = vx * vx + vy * vy || 1;
    const t = clamp(((px - ax) * vx + (py - ay) * vy) / l2, 0, 1);
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };

  const hitTest = (px: number, py: number, radius: number): number | null => {
    let best: number | null = null;
    let bestD = radius;
    cdata.forEach((c, ci) => {
      if (c.box.vis < 0.5) return;
      const s = c.screen;
      for (const [a, b] of c.segs) {
        if (!s[a * 3 + 2] || !s[b * 3 + 2]) continue;
        const d = distToSeg(px, py, s[a * 3], s[a * 3 + 1], s[b * 3], s[b * 3 + 1]);
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      }
      for (let i = 0; i < c.starPos.length; i++) {
        if (!s[i * 3 + 2]) continue;
        const d = Math.hypot(px - s[i * 3], py - s[i * 3 + 1]) * 0.9;
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      }
    });
    return best;
  };

  /* --------------------------- focus --------------------------- */

  const syncFromCamera = () => {
    eTmp.setFromQuaternion(camera.quaternion, "YXZ");
    yaw = eTmp.y;
    pitch = clamp(eTmp.x, -PITCH_LIMIT, PITCH_LIMIT);
  };

  /** Field of view that frames constellation i (small ones like Crux get a dolly-in). */
  const spans = cdata.map((c) => {
    let m = 0;
    for (const p of c.starPos) m = Math.max(m, tmp.copy(p).normalize().angleTo(c.centroid));
    return m / DEG;
  });
  const zoomFor = (i: number) => {
    const portrait = camera.aspect < 0.8;
    const need = spans[i] * 2 * (portrait ? 2.6 : 1.9) + 8;
    return clamp(need, portrait ? 34 : 28, baseFov);
  };

  const baseQuat = new THREE.Quaternion();
  const focus = (i: number, duration = 1.7) => {
    if (i < 0 || i >= N) return;
    focused = i;
    const t = dirToYawPitch(cdata[i].centroid);
    tween.from.setFromEuler(eTmp.set(pitch, yaw, 0, "YXZ"));
    tween.to.setFromEuler(eTmp.set(clamp(t.pitch, -PITCH_LIMIT, PITCH_LIMIT), t.yaw, 0, "YXZ"));
    tween.t = 0;
    tween.dur = duration;
    tween.fovFrom = fovOffset;
    tween.fovTo = zoomFor(i) - baseFov;
    tween.active = true;
    yawVel = 0;
    pitchVel = 0;
    lastIdle = performance.now();
    // Re-draw the target's lines from the first segment.
    uProgress.value[i] = 0;
  };

  /* --------------------------- DOM overlays --------------------------- */

  const corners = opts.reticle ? Array.from(opts.reticle.querySelectorAll<HTMLElement>("[data-corner]")) : [];
  const reticleTag = opts.reticle?.querySelector<HTMLElement>("[data-tag]") ?? null;
  const ret = { x0: 0, y0: 0, x1: 0, y1: 0, op: 0, target: -1, init: false };
  const labelState = constellations.map(() => ({ op: -1, active: false }));
  let readoutTick = 0;

  const updateOverlays = (dt: number) => {
    const target = canvasHover ?? externalHover ?? focused;
    // labels
    cdata.forEach((c, i) => {
      const el = opts.labels[i];
      if (!el) return;
      const b = c.box;
      let op = 0;
      if (b.vis >= 0.6) {
        const cx = (b.x0 + b.x1) / 2;
        const cy = b.y1 + 18;
        const edge = Math.min(cx, cssW - cx, cy, cssH - cy);
        op = clamp(edge / 60, 0, 1) * clamp((b.vis - 0.6) / 0.3, 0, 1);
        el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translateX(-50%)`;
      }
      const ls = labelState[i];
      const rounded = Math.round(op * 100) / 100;
      if (rounded !== ls.op) {
        ls.op = rounded;
        el.style.opacity = String(rounded);
        el.style.visibility = rounded > 0 ? "visible" : "hidden";
      }
      const active = i === target;
      if (active !== ls.active) {
        ls.active = active;
        if (active) el.dataset.active = "true";
        else delete el.dataset.active;
      }
    });

    // reticle
    if (opts.reticle && corners.length === 4) {
      const b = cdata[target].box;
      const pad = 26;
      const visible = b.vis >= 0.6;
      if (visible) {
        const tx0 = b.x0 - pad;
        const ty0 = b.y0 - pad;
        const tx1 = b.x1 + pad;
        const ty1 = b.y1 + pad;
        if (!ret.init || ret.target !== target) {
          // grow out of the centre of the new target for a "lock-on" feel
          if (!ret.init || ret.op < 0.05) {
            const cx = (tx0 + tx1) / 2;
            const cy = (ty0 + ty1) / 2;
            ret.x0 = cx - 10;
            ret.x1 = cx + 10;
            ret.y0 = cy - 10;
            ret.y1 = cy + 10;
          }
          ret.init = true;
          if (ret.target !== target && reticleTag) {
            reticleTag.textContent = constellations[target].name;
          }
          ret.target = target;
        }
        const k = 1 - Math.exp(-dt * 9);
        ret.x0 += (tx0 - ret.x0) * k;
        ret.y0 += (ty0 - ret.y0) * k;
        ret.x1 += (tx1 - ret.x1) * k;
        ret.y1 += (ty1 - ret.y1) * k;
      }
      const opTarget = visible ? 1 : 0;
      ret.op += (opTarget - ret.op) * (1 - Math.exp(-dt * 8));
      opts.reticle.style.opacity = ret.op.toFixed(3);
      const pts: [number, number][] = [
        [ret.x0, ret.y0],
        [ret.x1, ret.y0],
        [ret.x0, ret.y1],
        [ret.x1, ret.y1],
      ];
      corners.forEach((el, i) => {
        el.style.transform = `translate3d(${pts[i][0].toFixed(1)}px, ${pts[i][1].toFixed(1)}px, 0)`;
      });
    }

    // readout
    if (opts.readout && ++readoutTick % 8 === 0) {
      camera.getWorldDirection(tmp);
      const f = formatRaDec(tmp.x, tmp.y, tmp.z);
      const txt = `RA ${f.ra} · Dec ${f.dec} · FOV ${Math.round(camera.fov)}°`;
      if (opts.readout.textContent !== txt) opts.readout.textContent = txt;
    }
  };

  /* --------------------------- loop --------------------------- */

  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const parQuat = new THREE.Quaternion();
  let raf = 0;
  let running = false;
  let last = performance.now();
  let slowFrames = 0;
  let frameCount = 0;

  const updateCamera = (dt: number) => {
    if (tween.active) {
      tween.t = Math.min(1, tween.t + dt / tween.dur);
      const k = easeInOutCubic(tween.t);
      baseQuat.slerpQuaternions(tween.from, tween.to, k);
      fovOffset = tween.fovFrom + (tween.fovTo - tween.fovFrom) * k;
      if (tween.t >= 1) {
        tween.active = false;
        eTmp.setFromQuaternion(tween.to, "YXZ");
        yaw = eTmp.y;
        pitch = eTmp.x;
        fovOffset = tween.fovTo;
      } else {
        eTmp.setFromQuaternion(baseQuat, "YXZ");
        yaw = eTmp.y;
        pitch = clamp(eTmp.x, -PITCH_LIMIT, PITCH_LIMIT);
      }
    } else {
      if (!drag || drag.mode !== "rotate") {
        // inertia
        yaw += yawVel * dt;
        pitch = clamp(pitch + pitchVel * dt, -PITCH_LIMIT, PITCH_LIMIT);
        const decay = Math.exp(-dt * 3.2);
        yawVel *= decay;
        pitchVel *= decay;
        // slow sidereal-like drift when idle
        if (performance.now() - lastIdle > 6000) yaw += dt * 0.0055;
      }
      // free exploration slowly releases a focus zoom
      if (drag && drag.mode === "rotate") fovOffset += (0 - fovOffset) * (1 - Math.exp(-dt * 1.4));
      baseQuat.setFromEuler(eTmp.set(pitch, yaw, 0, "YXZ"));
    }

    // idle mouse parallax: tiny look-offset + camera translation (shell parallax)
    const tx = pointer.inside && !drag ? pointer.nx : 0;
    const ty = pointer.inside && !drag ? pointer.ny : 0;
    const pk = 1 - Math.exp(-dt * 2.5);
    parallax.x += (tx - parallax.x) * pk;
    parallax.y += (ty - parallax.y) * pk;
    parQuat.setFromEuler(eTmp.set(-parallax.y * 0.025, -parallax.x * 0.035, 0, "YXZ"));
    camera.quaternion.copy(baseQuat).multiply(parQuat);

    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const sway = clamp(yawVel * 0.6, -1, 1);
    camera.position
      .set(0, 0, 0)
      .addScaledVector(right, parallax.x * 1.6 - sway)
      .addScaledVector(up, -parallax.y * 1.0);

    const fov = baseFov + fovOffset;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  };

  const updateActivity = (dt: number) => {
    const hov = canvasHover ?? externalHover;
    for (let i = 0; i < N; i++) {
      const on = i === focused || i === hov;
      const target = on ? 1 : 0;
      uActive.value[i] += (target - uActive.value[i]) * (1 - Math.exp(-dt * 6));
      const segs = cdata[i].segs.length;
      const holdForIntro = tween.active && i === focused && tween.t < 0.55;
      if (on && !holdForIntro) {
        uProgress.value[i] = Math.min(1, uProgress.value[i] + dt / (0.55 + segs * 0.085));
      } else if (!on) {
        uProgress.value[i] = Math.max(0, uProgress.value[i] - dt * 1.4);
      }
    }
    // halos brighten with their constellation
    haloStars.forEach((h, i) => {
      const a = h.idx < N ? uActive.value[h.idx] : 0;
      haloUniform[i].w = h.base * (0.6 + 0.8 * a);
    });
  };

  const updateMeteor = (dt: number) => {
    if (!meteor.active) {
      meteor.next -= dt;
      if (meteor.next <= 0) {
        camera.getWorldDirection(tmp);
        right.set(1, 0, 0).applyQuaternion(camera.quaternion);
        up.set(0, 1, 0).applyQuaternion(camera.quaternion);
        meteor.dir0
          .copy(tmp)
          .addScaledVector(right, (rand() - 0.5) * 0.9)
          .addScaledVector(up, (rand() - 0.2) * 0.5)
          .normalize();
        // travel direction: mostly downward-diagonal across the view
        const travel = new THREE.Vector3()
          .addScaledVector(right, rand() < 0.5 ? -1 : 1)
          .addScaledVector(up, -0.35 - rand() * 0.5)
          .normalize();
        meteor.axis.crossVectors(meteor.dir0, travel).normalize();
        meteor.sweep = 0.28 + rand() * 0.18;
        meteor.life = 0.7 + rand() * 0.4;
        meteor.t = 0;
        meteor.active = true;
      }
      meteorUniforms.uFade.value = 0;
      return;
    }
    meteor.t += dt;
    const k = meteor.t / meteor.life;
    if (k >= 1) {
      meteor.active = false;
      meteor.next = 6 + rand() * 9;
      meteorUniforms.uFade.value = 0;
      return;
    }
    const head = meteor.sweep * k;
    const tail = Math.max(0, head - 0.13);
    qTmp.setFromAxisAngle(meteor.axis, head);
    meteorUniforms.uB.value.copy(meteor.dir0).applyQuaternion(qTmp).multiplyScalar(R_METEOR);
    qTmp.setFromAxisAngle(meteor.axis, tail);
    meteorUniforms.uA.value.copy(meteor.dir0).applyQuaternion(qTmp).multiplyScalar(R_METEOR);
    meteorUniforms.uFade.value = Math.sin(Math.PI * k);
  };

  const updateHover = () => {
    let h: number | null = null;
    if (pointer.inside && !drag) h = hitTest(pointer.x, pointer.y, 24);
    if (h !== canvasHover) {
      canvasHover = h;
      setCursor(h !== null ? "pointer" : "grab");
      opts.onHover(h);
    }
  };

  const renderOnce = () => {
    updateCamera(0);
    projectAll();
    updateOverlays(1);
    renderer.render(scene, camera);
  };

  const tick = () => {
    raf = 0;
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uTime.value += dt;

    updateCamera(dt);
    updateActivity(dt);
    updateMeteor(dt);
    projectAll();
    updateHover();
    updateOverlays(dt);
    renderer.render(scene, camera);

    // Adaptive resolution: if we are consistently slow, drop the pixel ratio a notch.
    frameCount++;
    if (frameCount > 30) {
      if (now - lastFrameAt > 26) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr - 0.25);
        slowFrames = 0;
        applySize();
      }
    }
    lastFrameAt = now;
    raf = requestAnimationFrame(tick);
  };
  let lastFrameAt = performance.now();

  const setRunning = (v: boolean) => {
    if (v === running) return;
    running = v;
    if (v) {
      last = performance.now();
      lastFrameAt = last;
      frameCount = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  let inView = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        inView = entry.isIntersecting;
        if (!introDone && entry.intersectionRatio >= 0.22) {
          introDone = true;
          focus(focused, 3.4);
        }
      }
      setRunning(inView && !document.hidden);
    },
    { threshold: [0, 0.22, 0.5] },
  );
  io.observe(stage);

  const onVisibility = () => setRunning(inView && !document.hidden);
  document.addEventListener("visibilitychange", onVisibility);

  renderOnce();

  return {
    focus(i, duration) {
      introDone = true;
      focus(i, duration);
      if (!running) renderOnce();
    },
    setHover(i) {
      externalHover = i;
    },
    dispose() {
      setRunning(false);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("pointerleave", onLeave);
      stage.style.cursor = "";
      for (const d of disposables) d.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
