/**
 * Hero WebGL scene — a port of the BEM UI home orbit (components/home/orbit/scene.ts):
 * rings of instanced cards (one InstancedMesh + one canvas atlas = one draw call) circling
 * the centre in strong perspective, the scroll-velocity "shared-wave" distort shader and the
 * cylinder grid seen from inside. The extruded BEM logo is replaced by an AI neural core.
 *
 * Additions for the portfolio: navy shader backdrop + star dust, depth-sorted cards with a
 * hover highlight, an intro fly-in, cursor tilt, and a view offset so the core can sit
 * wherever the layout puts its anchor (right of the copy on desktop, top on mobile).
 *
 * Loop stops when the canvas is off-screen or the tab is hidden; dispose() frees everything.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearMipmapLinearFilter,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  NoColorSpace,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Sphere,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { buildCardAtlas, readableAccent, type AtlasCard } from "./cardAtlas";
import { createNeuralCore, rgb } from "./neuralCore";

export type { AtlasCard };

export interface HeroSceneOptions {
  canvas: HTMLCanvasElement;
  cards: AtlasCard[];
  /** Resolves a /public path (basePath aware). */
  resolve: (path: string) => string;
  mobile: boolean;
  /** Where the core should sit, in canvas CSS pixels. */
  getAnchor: () => { x: number; y: number } | null;
  /** Hovered card → project index (or null). */
  onHover?: (item: number | null) => void;
  /** Project currently closest to the viewer (for the HUD). */
  onFront?: (item: number) => void;
}

export interface HeroSceneController {
  /** progress: 0..1 through the hero; scrollY: page scroll in px (drives wave + parallax). */
  setScroll(progress: number, scrollY: number): void;
  /** Project index under the pointer, or null. */
  pick(clientX: number, clientY: number): number | null;
  drag(dxPx: number): void;
  release(): void;
  /** Re-read the anchor + canvas size. */
  relayout(): void;
  stats: { neurons: number; synapses: number; cards: number };
  dispose(): void;
}

const RAD = Math.PI / 180;
const RADIUS_DESKTOP = 6;
const RADIUS_MOBILE = 4.4;
const CARD_H_DESKTOP = 2.3;
const ROW_PITCH = 3.2;
const CORE_R = 1.55;
/** Half-size of the core (world) + minimum gap; cards crossing in front of it are pushed away vertically. */
const CORE_HALF = 1.95;
const CORE_GAP = 0.4;
const AUTO_SPEED = 4; // deg / s
const HOVER_SPEED = 0.6;
const SCROLL_TURN_DEG = 150;
const SCROLL_TRAVEL = 0.0025;

const NAVY_950 = 0x05081a;
const NAVY_900 = 0x0b102d;
const NAVY_700 = 0x1c2860;

/* ---------------- card shader (port of the BEM "shared-wave" distort) ---------------- */

const CARD_VERT = /* glsl */ `
uniform float uTime;
uniform float uVel;
attribute vec4 aUv;
attribute float aAlpha;
attribute float aHover;
attribute vec3 aAccent;
varying vec2 vLocal;
varying vec4 vRect;
varying float vAlpha;
varying float vWave;
varying float vHover;
varying vec3 vAccent;
void main() {
  vLocal = uv;
  vRect = aUv;
  vAlpha = aAlpha;
  vHover = aHover;
  vAccent = aAccent;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  float wave = sin(world.y * 0.55 + uTime * 0.8) * uVel;
  vWave = wave * 0.1;
  vec3 p = position;
  p.z += wave * 0.09;
  p.z += sin(uv.x * 3.14159) * aHover * 0.08;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
}`;

const CARD_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uVel;
uniform float uTime;
varying vec2 vLocal;
varying vec4 vRect;
varying float vAlpha;
varying float vWave;
varying float vHover;
varying vec3 vAccent;
vec4 tex(vec2 l) {
  l = clamp(l, 0.0, 1.0);
  return texture2D(uMap, vRect.xy + l * vRect.zw);
}
void main() {
  if (vAlpha < 0.01) discard;
  // back faces are mirrored so text never reads backwards
  vec2 l = vec2(gl_FrontFacing ? vLocal.x : 1.0 - vLocal.x, vLocal.y);
  float reduced = uVel * 0.015;
  l.y += sin(l.x * 10.0) * reduced * 0.05;
  float shift = reduced * 0.02;
  vec4 base = tex(l);
  vec3 c = vec3(tex(l + vec2(shift, 0.0)).r, base.g, tex(l - vec2(shift, 0.0)).b);
  c += vWave * 0.1 * vec3(0.0, 0.35, 0.5);
  float edge = min(min(l.x, 1.0 - l.x), min(l.y, 1.0 - l.y));
  float rim = 1.0 - smoothstep(0.012, 0.07, edge);
  float sweep = l.x + (1.0 - l.y) * 0.6 - mod(uTime * 0.7, 2.6) + 0.4;
  float sheen = smoothstep(0.14, 0.0, abs(sweep));
  c = c * (1.0 + 0.28 * vHover) + vAccent * rim * vHover * 1.3 + vec3(sheen * 0.22 * vHover);
  if (!gl_FrontFacing) c *= 0.82;
  float a = base.a * vAlpha;
  if (a < 0.03) discard;
  gl_FragColor = vec4(c, a);
}`;

/* ---------------- backdrop ---------------- */

const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const BG_FRAG = /* glsl */ `
uniform vec2 uAnchor;
uniform float uAspect;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform vec3 uCyan;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y * 0.9 + vUv.x * 0.15));
  vec2 d = (vUv - uAnchor) * vec2(uAspect, 1.0);
  float r = length(d);
  col += uGlow * exp(-r * r * 3.2) * 0.6;
  col += uCyan * exp(-r * r * 22.0) * 0.06;
  // vignette
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.55;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

const STAR_VERT = /* glsl */ `
uniform float uTime;
uniform float uPR;
attribute float aSeed;
attribute float aSize;
varying float vSeed;
varying float vTw;
void main() {
  vSeed = aSeed;
  vTw = 0.55 + 0.45 * sin(uTime * (0.4 + aSeed * 1.6) + aSeed * 40.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPR * (0.8 + vTw * 0.4);
  gl_Position = projectionMatrix * mv;
}`;

const STAR_FRAG = /* glsl */ `
uniform vec3 uGold;
uniform vec3 uCyan;
varying float vSeed;
varying float vTw;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vTw;
  vec3 col = vec3(0.82, 0.88, 1.0);
  col = mix(col, uGold, step(0.93, vSeed));
  col = mix(col, uCyan, step(0.86, vSeed) * step(vSeed, 0.93));
  a *= 0.75;
  gl_FragColor = vec4(col * a, 1.0);
}`;

/** Cylinder grid (same parameters as the BEM BackgroundGrid). */
function createGrid(aspectTall: boolean) {
  const RADIUS_GRID = 30;
  const yExtent = 22;
  const SEG = 200;
  const VERTICALS = 80;
  const RINGS = aspectTall ? 22 : 16;
  const v: number[] = [];
  for (let i = 0; i < VERTICALS; i++) {
    const a = (i / VERTICALS) * Math.PI * 2;
    const x = Math.cos(a) * RADIUS_GRID;
    const z = Math.sin(a) * RADIUS_GRID;
    v.push(x, -yExtent, z, x, yExtent, z);
  }
  for (let r = 0; r <= RINGS; r++) {
    const y = -yExtent + (r / RINGS) * yExtent * 2;
    for (let s = 0; s < SEG; s++) {
      const a = (s / SEG) * Math.PI * 2;
      const b = ((s + 1) / SEG) * Math.PI * 2;
      v.push(Math.cos(a) * RADIUS_GRID, y, Math.sin(a) * RADIUS_GRID, Math.cos(b) * RADIUS_GRID, y, Math.sin(b) * RADIUS_GRID);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(v, 3));
  return { geo, period: (yExtent * 2) / RINGS };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function hexNum(hex: string) {
  return parseInt(hex.replace("#", ""), 16);
}

export async function createHeroScene(opts: HeroSceneOptions): Promise<HeroSceneController> {
  const { canvas, cards: items, mobile } = opts;
  const rings = mobile ? 2 : 3;
  // Portrait phones: a tighter ring of slightly smaller cards so the sides stay on screen.
  const RADIUS = mobile ? RADIUS_MOBILE : RADIUS_DESKTOP;
  const CARD_H = CARD_H_DESKTOP * (mobile ? 0.86 : 1);
  const CARD_W = CARD_H * (3 / 4);
  const perRing = mobile ? 6 : 8;
  const N = items.length ? rings * perRing : 0;
  const STEP = 360 / perRing;
  // Instance → project index; coprime step so neighbours differ.
  const step = [7, 3, 11, 13, 5].find((s) => gcd(s, Math.max(1, items.length)) === 1) ?? 1;
  const slots = Array.from({ length: N }, (_, i) => (i * step) % Math.max(1, items.length));

  // Build the atlas first (fonts + images) so the renderer never shows half-drawn cards.
  const atlas = await buildCardAtlas(items, opts.resolve, mobile ? 0.72 : 1);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(NAVY_950, 1);
  renderer.autoClear = false;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const disposables: Array<{ dispose(): void }> = [];

  /* ---------- backdrop + grid + stars (own scene & camera, like BackgroundGrid) ---------- */
  const bgScene = new Scene();
  const bgGeo = new PlaneGeometry(2, 2);
  const bgU = {
    uAnchor: { value: new Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uTop: { value: rgb(NAVY_950) },
    uBottom: { value: rgb(NAVY_900) },
    uGlow: { value: rgb(NAVY_700) },
    uCyan: { value: rgb(0x5ee6ff) },
  };
  const bgMat = new ShaderMaterial({ uniforms: bgU, vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthTest: false, depthWrite: false });
  const bg = new Mesh(bgGeo, bgMat);
  bg.frustumCulled = false;
  bgScene.add(bg);
  disposables.push(bgGeo, bgMat);

  const gridScene = new Scene();
  const gridCamera = new PerspectiveCamera(52, 1, 0.1, 300);
  gridCamera.position.set(0, 0, 10);
  const gridMat = new LineBasicMaterial({ color: 0x4f8bff, transparent: true, opacity: 0.075, depthWrite: false });
  let gridTall = false;
  let grid = createGrid(false);
  let gridLines = new LineSegments(grid.geo, gridMat);
  gridScene.add(gridLines);
  disposables.push(gridMat);
  let gridPos = 0;
  let gridTarget = 0;
  const gridHalf = () => Math.max(grid.period * 0.5, 1e-4);
  const gridWrap = (v: number) => {
    const t = Math.max(grid.period, 2e-4);
    let r = ((v % t) + t) % t;
    if (r >= gridHalf()) r -= t;
    return r;
  };
  const gridShortest = (from: number, to: number) => {
    const t = Math.max(grid.period, 2e-4);
    let d = to - from;
    while (d > gridHalf()) d -= t;
    while (d < -gridHalf()) d += t;
    return d;
  };

  // sparse star dust
  const STARS = mobile ? 320 : 650;
  const sPos = new Float32Array(STARS * 3);
  const sSeed = new Float32Array(STARS);
  const sSize = new Float32Array(STARS);
  for (let i = 0; i < STARS; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = 45 + Math.random() * 60;
    const s = Math.sqrt(1 - u * u);
    sPos[i * 3] = Math.cos(th) * s * r;
    sPos[i * 3 + 1] = u * r * 0.7;
    sPos[i * 3 + 2] = -Math.abs(Math.sin(th) * s * r) - 10;
    sSeed[i] = Math.random();
    sSize[i] = Math.random() < 0.08 ? 2.6 + Math.random() * 1.6 : 1 + Math.random() * 1.4;
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute("position", new Float32BufferAttribute(sPos, 3));
  starGeo.setAttribute("aSeed", new Float32BufferAttribute(sSeed, 1));
  starGeo.setAttribute("aSize", new Float32BufferAttribute(sSize, 1));
  const starU = { uTime: { value: 0 }, uPR: { value: dpr }, uGold: { value: rgb(0xf5c04a) }, uCyan: { value: rgb(0x5ee6ff) } };
  const starMat = new ShaderMaterial({
    uniforms: starU,
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const stars = new Points(starGeo, starMat);
  stars.frustumCulled = false;
  gridScene.add(stars);
  disposables.push(starGeo, starMat);

  /* ---------- main scene ---------- */
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 8.2);

  const core = createNeuralCore({ neurons: mobile ? 240 : 360, radius: CORE_R, pixelRatio: dpr });
  scene.add(core.group);
  disposables.push(core);

  const orbit = new Group();
  orbit.rotation.set(0.07, 0, -0.045);
  scene.add(orbit);

  const atlasTex = new CanvasTexture(atlas.canvas);
  atlasTex.colorSpace = NoColorSpace; // raw sRGB passes straight through the shader
  atlasTex.minFilter = LinearMipmapLinearFilter;
  atlasTex.anisotropy = Math.min(8, maxAniso);
  const cardGeo = new PlaneGeometry(CARD_W, CARD_H, 6, 16);
  const aUv = new InstancedBufferAttribute(new Float32Array(N * 4), 4);
  const aAlpha = new InstancedBufferAttribute(new Float32Array(N), 1);
  const aHover = new InstancedBufferAttribute(new Float32Array(N), 1);
  const aAccent = new InstancedBufferAttribute(new Float32Array(N * 3), 3);
  for (const a of [aUv, aAlpha, aHover, aAccent]) a.setUsage(DynamicDrawUsage);
  cardGeo.setAttribute("aUv", aUv);
  cardGeo.setAttribute("aAlpha", aAlpha);
  cardGeo.setAttribute("aHover", aHover);
  cardGeo.setAttribute("aAccent", aAccent);
  const accents = items.map((p) => rgb(hexNum(readableAccent(p.accent))));
  const cardU = { uMap: { value: atlasTex }, uTime: { value: 0 }, uVel: { value: 0 } };
  const cardMat = new ShaderMaterial({
    uniforms: cardU,
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    transparent: true,
    side: DoubleSide,
  });
  const cardMesh = new InstancedMesh(cardGeo, cardMat, Math.max(1, N));
  cardMesh.count = N;
  cardMesh.instanceMatrix.setUsage(DynamicDrawUsage);
  cardMesh.frustumCulled = false;
  cardMesh.boundingSphere = new Sphere(new Vector3(), RADIUS + 6);
  cardMesh.renderOrder = 1;
  orbit.add(cardMesh);
  disposables.push(atlasTex, cardGeo, cardMat);

  /* ---------- state ---------- */
  let rot = mobile ? 20 : 0;
  let vel = AUTO_SPEED;
  let dragging = false;
  let lastDragT = 0;
  let scrollDeg = 0;
  let scrollTarget = 0;
  let travel = 0;
  let travelTarget = 0;
  let lastScrollY: number | null = null;
  let waveTarget = 0;
  let wave = 0;
  let inView = true;
  let raf = 0;
  let last = performance.now();
  const t0 = last;
  let front = -1;
  let hoverInst: number | null = null; // logical card index
  let hoverItem: number | null = null;
  let hoverDirty = false;
  const ptr = { cx: -1, cy: -1, nx: 0, ny: 0, sx: 0, sy: 0 };
  const push = new Float32Array(N);
  const hoverAmt = new Float32Array(N);
  const zs = new Float32Array(N);
  const alphas = new Float32Array(N);
  const order = Array.from({ length: N }, (_, i) => i);
  /** drawn slot → logical card */
  const drawnToLogical = new Int32Array(N);
  const mats = Array.from({ length: N }, () => new Object3D());
  const raycaster = new Raycaster();
  const ndc = new Vector2();

  /* ---------- size ---------- */
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const portrait = aspect < 0.9;
    camera.aspect = aspect;
    camera.fov = portrait ? 58 : 50;
    camera.position.z = portrait ? 13 : aspect < 1.25 ? 10 : 8.2;
    gridCamera.aspect = aspect;
    const a = opts.getAnchor() ?? { x: w / 2, y: h / 2 };
    const dx = a.x - w / 2;
    const dy = a.y - h / 2;
    camera.setViewOffset(w, h, -dx, -dy, w, h);
    gridCamera.setViewOffset(w, h, -dx * 0.6, -dy * 0.6, w, h);
    camera.updateProjectionMatrix();
    gridCamera.updateProjectionMatrix();
    // point sprites are sized in pixels: keep them proportional to the stage height
    const k = Math.min(1.2, Math.max(0.6, h / 900));
    core.setPixelRatio(dpr * k);
    starU.uPR.value = dpr * Math.max(0.8, k);
    bgU.uAnchor.value.set(a.x / w, 1 - a.y / h);
    bgU.uAspect.value = aspect;
    const tall = h / w > 1;
    if (tall !== gridTall) {
      gridTall = tall;
      gridScene.remove(gridLines);
      grid.geo.dispose();
      grid = createGrid(tall);
      gridLines = new LineSegments(grid.geo, gridMat);
      gridScene.add(gridLines);
    }
    if (!raf) draw();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ---------- update & render ---------- */
  const layout = (intro: number) => {
    const total = rot + scrollDeg;
    const span = rings * ROW_PITCH;
    const half = span / 2;
    const camZ = camera.position.z;
    const radius = RADIUS * (1 + (1 - intro) * 0.9);
    let best = -Infinity;
    let bestI = 0;
    for (let i = 0; i < N; i++) {
      const r = Math.floor(i / perRing);
      const j = i % perRing;
      const th = (j * STEP + r * (STEP / 2) + total + (1 - intro) * 70 * (r % 2 ? -1 : 1)) * RAD;
      const yRing = (r - (rings - 1) / 2) * ROW_PITCH;
      const yw = ((((yRing + travel + half) % span) + span) % span) - half;
      const x = radius * Math.sin(th);
      const z = radius * Math.cos(th);
      // keep clear of the core: cards that would cover it are pushed up/down (not faded)
      const depth = camZ - z;
      const overlapX = CORE_HALF / camZ + CARD_W / 2 / depth;
      const wx = 1 - smooth(overlapX, overlapX + 0.05, Math.abs(x) / depth);
      const wz = 1 - smooth(0.5, 2.5, z);
      const req = (depth * (CORE_HALF + CORE_GAP)) / camZ + CARD_H / 2;
      const want = Math.abs(yw) < req ? (Math.sign(yw) || 1) * (req - Math.abs(yw)) : 0;
      push[i] += (want * wx * wz - push[i]) * 0.12;
      const target = i === hoverInst ? 1 : 0;
      hoverAmt[i] += (target - hoverAmt[i]) * 0.14;
      const o = mats[i];
      o.position.set(x, yw + push[i], z);
      o.rotation.set(0, th + Math.PI, 0); // facing inward, toward the core
      o.scale.setScalar(1 + hoverAmt[i] * 0.1);
      o.updateMatrix();
      const nearCam = smooth(1.6, 3.2, z);
      const edgeY = smooth(half - 1.3, half - 0.15, Math.abs(yw));
      const op = (1 - nearCam) * (1 - edgeY) * smooth(0, 0.6, intro);
      alphas[i] = op;
      zs[i] = z;
      const score = (z + RADIUS) * op;
      if (score > best) {
        best = score;
        bestI = i;
      }
    }
    // draw back-to-front so translucent cards blend correctly
    order.sort((a, b) => zs[a] - zs[b]);
    for (let k = 0; k < N; k++) {
      const i = order[k];
      drawnToLogical[k] = i;
      cardMesh.setMatrixAt(k, mats[i].matrix);
      const item = slots[i];
      aUv.setXYZW(k, atlas.uvs[item * 4], atlas.uvs[item * 4 + 1], atlas.uvs[item * 4 + 2], atlas.uvs[item * 4 + 3]);
      aAlpha.setX(k, alphas[i]);
      aHover.setX(k, hoverAmt[i]);
      const c = accents[item];
      aAccent.setXYZ(k, c[0], c[1], c[2]);
    }
    cardMesh.instanceMatrix.needsUpdate = true;
    aUv.needsUpdate = true;
    aAlpha.needsUpdate = true;
    aHover.needsUpdate = true;
    aAccent.needsUpdate = true;
    const item = N ? slots[bestI] : -1;
    if (item !== front && item >= 0) {
      front = item;
      opts.onFront?.(item);
    }
  };

  const draw = () => {
    renderer.clear();
    renderer.render(bgScene, camera);
    renderer.render(gridScene, gridCamera);
    renderer.clearDepth();
    renderer.render(scene, camera);
  };

  function pickInstance(clientX: number, clientY: number): number | null {
    if (!N) return null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(cardMesh, false);
    // nearest hit first; skip faded cards
    for (const h of hits) {
      if (h.instanceId === undefined) continue;
      const i = drawnToLogical[h.instanceId];
      if (alphas[i] > 0.35) return i;
    }
    return null;
  }

  const updateHover = () => {
    if (!hoverDirty || dragging) return;
    hoverDirty = false;
    const inst = ptr.cx < 0 ? null : pickInstance(ptr.cx, ptr.cy);
    hoverInst = inst;
    const item = inst === null ? null : slots[inst];
    if (item !== hoverItem) {
      hoverItem = item;
      opts.onHover?.(item);
    }
  };

  const shouldRun = () => inView && !document.hidden;

  const frame = (now: number) => {
    raf = 0;
    if (!shouldRun()) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    const intro = easeOutExpo(Math.min(1, t / 2.2));
    if (!dragging) {
      rot += vel * dt;
      const target = hoverInst !== null ? HOVER_SPEED : AUTO_SPEED;
      vel += (target - vel) * Math.min(1, dt * 1.6);
    }
    scrollDeg += (scrollTarget - scrollDeg) * Math.min(1, dt * 2.5);
    wave += (waveTarget - wave) * 0.09;
    waveTarget *= 0.965;
    if (wave < 1e-4) wave = 0;
    cardU.uVel.value = wave;
    cardU.uTime.value = t;
    starU.uTime.value = t;

    const d = gridShortest(gridPos, gridTarget);
    gridPos = Math.abs(d) > 1e-4 ? gridWrap(gridPos + d * 0.08) : gridTarget;
    gridLines.position.y = gridPos;
    stars.position.y = gridPos * 0.35;
    stars.rotation.y = t * 0.004;
    travel += (travelTarget - travel) * 0.05;

    // cursor tilt (smoothed)
    ptr.sx += (ptr.nx - ptr.sx) * Math.min(1, dt * 3);
    ptr.sy += (ptr.ny - ptr.sy) * Math.min(1, dt * 3);
    core.group.rotation.set(ptr.sy * 0.35, ptr.sx * 0.5, 0);
    core.spin.rotation.y += dt * 0.14;
    core.spin.rotation.x = Math.sin(t * 0.21) * 0.18;
    const breath = 1 + Math.sin(t * 1.3) * 0.03;
    core.group.scale.setScalar(breath * (0.55 + 0.45 * intro));
    core.update(t, dt);
    orbit.rotation.x = 0.07 + ptr.sy * 0.05;
    orbit.rotation.z = -0.045 + ptr.sx * 0.03;
    gridCamera.position.x = ptr.sx * 0.6;
    gridCamera.position.y = -ptr.sy * 0.4;

    layout(intro);
    draw();
    updateHover();
    raf = requestAnimationFrame(frame);
  };

  const kick = () => {
    if (!raf && shouldRun()) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    kick();
  });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener("visibilitychange", onVis);
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    // only pick when the pointer is really over the canvas (not over copy / buttons)
    const over = e.target === canvas;
    ptr.cx = over ? e.clientX : -1;
    ptr.cy = over ? e.clientY : -1;
    ptr.nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1));
    ptr.ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1));
    hoverDirty = true;
  };
  const onLeave = () => {
    ptr.cx = -1;
    ptr.cy = -1;
    hoverDirty = true;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  resize();
  layout(0);
  kick();

  return {
    stats: { neurons: core.stats.neurons, synapses: core.stats.synapses, cards: N },
    setScroll(progress, scrollY) {
      scrollTarget = progress * SCROLL_TURN_DEG;
      if (lastScrollY !== null) {
        const delta = scrollY - lastScrollY;
        if (delta !== 0) {
          gridTarget = gridWrap(gridTarget - delta * 0.003);
          travelTarget -= delta * SCROLL_TRAVEL;
          waveTarget = Math.min(5, Math.abs(delta) * 0.25);
          hoverDirty = true;
        }
      }
      lastScrollY = scrollY;
    },
    pick(clientX, clientY) {
      const i = pickInstance(clientX, clientY);
      return i === null ? null : slots[i];
    },
    drag(dx) {
      const now = performance.now();
      const dtMs = Math.max(1, now - lastDragT);
      dragging = true;
      rot += dx * 0.2;
      vel = (dx * 0.2) / (dtMs / 1000);
      lastDragT = now;
    },
    release() {
      dragging = false;
      vel = Math.max(-240, Math.min(240, vel));
    },
    relayout: resize,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      grid.geo.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
