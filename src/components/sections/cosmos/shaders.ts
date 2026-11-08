/**
 * GLSL for the Cosmos sky. All colours are authored directly in sRGB and the
 * materials skip three's colour-space chunk, so what you read here is what
 * lands on screen.
 */

/** Ashima / Stefan Gustavson 3D simplex noise (MIT). Returns ~[-1, 1]. */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

const PALETTE = /* glsl */ `
const vec3 C_NAVY950 = vec3(0.020, 0.031, 0.102);
const vec3 C_NAVY900 = vec3(0.043, 0.063, 0.176);
const vec3 C_NAVY800 = vec3(0.078, 0.114, 0.282);
const vec3 C_NAVY700 = vec3(0.110, 0.157, 0.376);
const vec3 C_PRIMARY = vec3(0.184, 0.255, 0.600);
const vec3 C_SKY = vec3(0.310, 0.545, 1.000);
const vec3 C_CYAN = vec3(0.369, 0.902, 1.000);
const vec3 C_GOLD = vec3(0.961, 0.753, 0.290);
const vec3 C_CREAM = vec3(1.000, 0.957, 0.839);
`;

/* ------------------------------------------------------------------ */
/* Sky dome — painterly flow field                                      */
/* ------------------------------------------------------------------ */

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * `bake = true`  → the expensive painterly field (vortices, warped noise, brush
 *                  strokes, Milky Way), rendered ONCE into a cubemap.
 * `bake = false` → per-frame shader: samples that cubemap and only adds the
 *                  cheap animated layers (star halos + moon).
 */
export const skyFrag = (halos: number, vortices: number, bake = false) => /* glsl */ `
${bake ? "#define SKY_BAKE" : ""}
uniform samplerCube uSkyMap;
uniform float uTime;
uniform vec4 uHalos[${halos}];
uniform vec4 uVortex[${vortices}];
uniform vec3 uMoon;
uniform vec3 uGalPole;
varying vec3 vDir;
${NOISE}
${PALETTE}

vec3 rotAxis(vec3 v, vec3 k, float a) {
  float c = cos(a);
  float s = sin(a);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}

void main() {
  vec3 dir = normalize(vDir);
  float t = uTime;
  vec3 col;

#ifdef SKY_BAKE
  // 1. Vortices twist the sampling domain -> strokes spiral around them.
  vec3 d = dir;
  float eddy = 0.0;
  for (int i = 0; i < ${vortices}; i++) {
    vec3 c = uVortex[i].xyz;
    float r = length(dir - c);
    float fall = exp(-r * r * 9.0);
    d = rotAxis(d, c, uVortex[i].w * fall * (1.0 + 0.12 * sin(t * 0.15 + float(i) * 1.7)));
    eddy += fall;
  }

  // 2. Domain-warped noise field (the "wind" of the painting).
  float ts = t * 0.025;
  vec3 p = d * 2.3;
  vec3 w = vec3(
    snoise(p * 0.85 + vec3(0.0, ts, 3.7)),
    snoise(p * 0.85 + vec3(5.2, -ts, 1.3)),
    snoise(p * 0.85 + vec3(9.1, 2.7, ts))
  );
  vec3 q = p + w * 0.68;
  float f = snoise(q) * 0.66
          + snoise(q * 2.07 + vec3(3.1, ts * 1.5, 0.0)) * 0.22
          + snoise(q * 4.3 - 1.7) * 0.06;

  // 3. Brush strokes: dashed iso-contours of the warped field. Contours run
  //    perpendicular to the gradient, i.e. along the flow, so every dab is
  //    an anisotropic mark that follows the swirl.
  float bands = f * 10.0 + t * 0.02;
  float bid = floor(bands);
  float bf = fract(bands);
  float aa = fwidth(bands) * 1.2;
  float body = smoothstep(0.0, 0.1 + aa, bf) * (1.0 - smoothstep(0.52 - aa, 0.66 + aa, bf));
  float dab = snoise(q * 7.5 + vec3(bid * 1.7, bid * 0.3, 0.0));
  float dabMask = smoothstep(-0.12, 0.22, dab);
  float bristle = 0.7 + 0.3 * sin(bf * 46.0 + dab * 3.0);
  bristle = mix(bristle, 0.85, smoothstep(0.04, 0.16, aa));
  float stroke = body * dabMask * bristle;

  // Calm and busy regions, like the painting's quiet sky between the eddies.
  float busy = smoothstep(-0.35, 0.55, snoise(d * 1.25 + vec3(20.0, 0.0, ts)));
  float hsh = hash12(vec2(bid, 7.13));
  vec3 strokeCol = hsh < 0.38 ? C_PRIMARY : (hsh < 0.66 ? C_NAVY700 * 1.5 : (hsh < 0.95 ? C_SKY : C_CYAN * 0.7));
  float strokeAmt = (0.22 + 0.5 * busy) * (0.6 + 0.4 * smoothstep(-0.4, 0.7, f)) + 0.35 * min(eddy, 1.0);

  // 4. Base canvas: deep navy, lifted where the field is high.
  col = mix(C_NAVY950, C_NAVY900, smoothstep(-0.9, 0.5, f + dir.y * 0.25));
  col = mix(col, C_NAVY800, smoothstep(0.3, 0.95, f) * 0.5);
  col += strokeCol * stroke * strokeAmt * 0.6;

  // 5. Milky Way along the real galactic plane, with a dusty rift.
  float g = dot(dir, uGalPole);
  float band = exp(-g * g * 22.0);
  float mottled = band * (0.55 + 0.45 * snoise(q * 1.6 + 11.0));
  col += mix(C_SKY, C_CREAM, 0.4) * mottled * 0.11;
  col += C_CREAM * stroke * mottled * 0.2;
  float rift = smoothstep(0.15, 0.7, snoise(q * 2.2 + 4.0)) * exp(-g * g * 140.0);
  col *= 1.0 - rift * 0.4;
  gl_FragColor = vec4(col, 1.0);
  return;
#else
  col = textureCube(uSkyMap, dir).rgb;
#endif

  // 6. Luminous halos with concentric swirl rings around the brightest stars.
  for (int i = 0; i < ${halos}; i++) {
    vec4 hs = uHalos[i];
    vec3 c = hs.xyz;
    vec3 dv = dir - c;
    float r = length(dv);
    if (r > 0.24 || hs.w <= 0.0) continue;
    vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.0)));
    vec3 v = cross(c, u);
    float a = atan(dot(dv, v), dot(dv, u));
    float ring = smoothstep(0.4, 0.95, 0.5 + 0.5 * sin(r * 190.0 - a - t * 0.5 + float(i) * 1.3));
    float env = exp(-r * 15.0);
    float glow = exp(-r * 55.0);
    col += C_GOLD * ring * env * 0.3 * hs.w;
    col += mix(C_GOLD, C_CREAM, glow) * glow * 0.5 * hs.w;
  }

  // 7. Crescent moon with its own ringed corona.
  {
    vec3 c = uMoon;
    vec3 dv = dir - c;
    float r = length(dv);
    vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.0)));
    vec3 v = cross(c, u);
    vec2 l = vec2(dot(dv, u), dot(dv, v));
    float R = 0.036;
    float front = step(0.0, dot(dir, c));
    float disc = (1.0 - smoothstep(R - 0.0025, R + 0.0025, length(l))) * front;
    float bite = 1.0 - smoothstep(R * 0.9 - 0.0025, R * 0.9 + 0.0025, length(l - vec2(-0.017, 0.011)));
    float cres = disc * (1.0 - bite);
    float a = atan(l.y, l.x);
    float rings = smoothstep(0.35, 0.95, 0.5 + 0.5 * sin(r * 120.0 - a - t * 0.35));
    col += C_GOLD * rings * exp(-r * 7.0) * 0.26 * (1.0 - disc);
    col += C_GOLD * exp(-r * 20.0) * 0.32;
    col = mix(col, mix(C_GOLD, C_CREAM, 0.7), cres);
  }

  col += (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Background star shells                                              */
/* ------------------------------------------------------------------ */

export const STARS_VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
uniform float uTime;
uniform float uScale;
uniform float uTwinkle;
varying vec3 vColor;
varying float vTw;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.7 + 0.3 * sin(uTime * (0.7 + aPhase * 2.6) + aPhase * 40.0);
  vTw = mix(1.0, tw, uTwinkle);
  vColor = aColor;
  gl_PointSize = max(1.0, aSize * uScale * (60.0 / -mv.z) * (0.85 + 0.3 * vTw));
}
`;

export const STARS_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vTw;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = 1.0 - smoothstep(0.0, 1.0, d);
  core = pow(core, 2.4);
  gl_FragColor = vec4(vColor * core * vTw, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Constellation + landmark stars                                       */
/* ------------------------------------------------------------------ */

export const cStarVert = (slots: number) => /* glsl */ `
attribute float aSize;
attribute float aIdx;
attribute float aSeed;
uniform float uActive[${slots}];
uniform float uTime;
uniform float uScale;
varying float vAct;
varying float vSeed;
varying float vTw;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float act = uActive[int(aIdx + 0.5)];
  vAct = act;
  vSeed = aSeed;
  vTw = 0.86 + 0.14 * sin(uTime * (1.1 + aSeed * 2.0) + aSeed * 31.0);
  gl_PointSize = aSize * uScale * (1.0 + act * 0.6);
}
`;

export const C_STAR_FRAG = /* glsl */ `
uniform float uTime;
varying float vAct;
varying float vSeed;
varying float vTw;
const vec3 COOL = vec3(0.80, 0.88, 1.0);
const vec3 GOLD = vec3(0.961, 0.753, 0.290);
const vec3 CREAM = vec3(1.0, 0.957, 0.839);
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 70.0);
  float glow = exp(-d * 5.5) * (0.28 + 0.6 * vAct);
  float a = atan(c.y, c.x);
  float rr = 0.6 + 0.03 * sin(a * 3.0 + uTime * 0.8 + vSeed * 6.0);
  float ring = 1.0 - smoothstep(0.0, 0.07, abs(d - rr));
  float dash = 0.5 + 0.5 * sin(a * 5.0 - uTime * 1.3 + vSeed * 6.0);
  ring *= dash * vAct;
  float edge = 1.0 - smoothstep(0.82, 1.0, d);
  vec3 col = CREAM * core * 1.5 + mix(COOL, GOLD, vAct) * glow * 0.6 + GOLD * ring * 0.65;
  gl_FragColor = vec4(col * vTw * edge, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Constellation lines — screen-space ribbons with a draw-in progress   */
/* ------------------------------------------------------------------ */

export const lineVert = (slots: number) => /* glsl */ `
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aSide;
attribute float aT;
attribute float aIdx;
attribute float aS0;
attribute float aS1;
attribute float aLen;
uniform vec2 uResolution;
uniform float uWidth;
uniform float uActive[${slots}];
uniform float uProgress[${slots}];
varying float vT;
varying float vSide;
varying float vAlong;
varying float vAct;
varying float vProg;
varying float vLen;
void main() {
  int i = int(aIdx + 0.5);
  vAct = uActive[i];
  vProg = uProgress[i];
  vT = aT;
  vSide = aSide;
  vAlong = mix(aS0, aS1, aT);
  vLen = aLen;
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 a = mvp * vec4(aStart, 1.0);
  vec4 b = mvp * vec4(aEnd, 1.0);
  if (a.w <= 0.0 || b.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  vec2 dpx = (b.xy / b.w - a.xy / a.w) * uResolution;
  vec2 dir = length(dpx) > 0.0001 ? normalize(dpx) : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  vec4 cur = mix(a, b, aT);
  float w = uWidth * (1.0 + vAct * 0.75);
  cur.xy += nrm * aSide * w * 2.0 / uResolution * cur.w;
  gl_Position = cur;
}
`;

export const LINE_FRAG = /* glsl */ `
uniform float uTime;
varying float vT;
varying float vSide;
varying float vAlong;
varying float vAct;
varying float vProg;
varying float vLen;
void main() {
  float edge = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
  float dash = smoothstep(0.38, 0.5, fract(vT * vLen - uTime * 0.06));
  float drawn = (1.0 - smoothstep(vProg - 0.003, vProg + 0.003, vAlong)) * step(0.0005, vProg);
  float head = exp(-abs(vProg - vAlong) * 70.0) * drawn * (1.0 - step(0.995, vProg));
  vec3 cool = vec3(0.56, 0.68, 1.0);
  vec3 warm = vec3(1.0, 0.87, 0.6);
  vec3 col = cool * dash * 0.14 * (1.0 - drawn)
           + mix(cool, warm, vAct) * drawn * (0.3 + 0.62 * vAct)
           + vec3(1.0, 0.86, 0.52) * head * 1.3;
  gl_FragColor = vec4(col * edge, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Shooting star                                                        */
/* ------------------------------------------------------------------ */

export const METEOR_VERT = /* glsl */ `
attribute float aSide;
attribute float aT;
uniform vec3 uA;
uniform vec3 uB;
uniform vec2 uResolution;
uniform float uWidth;
varying float vT;
varying float vSide;
void main() {
  vT = aT;
  vSide = aSide;
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 a = mvp * vec4(uA, 1.0);
  vec4 b = mvp * vec4(uB, 1.0);
  if (a.w <= 0.0 || b.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  vec2 dpx = (b.xy / b.w - a.xy / a.w) * uResolution;
  vec2 dir = length(dpx) > 0.0001 ? normalize(dpx) : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  vec4 cur = mix(a, b, aT);
  cur.xy += nrm * aSide * uWidth * (0.3 + 0.7 * aT) * 2.0 / uResolution * cur.w;
  gl_Position = cur;
}
`;

export const METEOR_FRAG = /* glsl */ `
uniform float uFade;
varying float vT;
varying float vSide;
void main() {
  float edge = 1.0 - smoothstep(0.2, 1.0, abs(vSide));
  float tail = pow(vT, 2.2);
  vec3 col = mix(vec3(0.31, 0.545, 1.0), vec3(1.0, 0.96, 0.84), vT);
  gl_FragColor = vec4(col * tail * edge * uFade * 1.4, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Nebulae / galaxies (billboards)                                      */
/* ------------------------------------------------------------------ */

export const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const NEBULA_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uOpacity;
uniform float uSeed;
uniform float uTime;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float fall = 1.0 - smoothstep(0.0, 1.0, r);
  fall *= fall;
  float n = snoise(vec3(p * 3.0, uSeed + uTime * 0.012)) * 0.55
          + snoise(vec3(p * 7.5, uSeed * 2.0 - uTime * 0.008)) * 0.25;
  float cloud = fall * smoothstep(-0.35, 0.75, n + 0.45 * (1.0 - r));
  float core = exp(-r * r * 18.0);
  vec3 col = mix(uColor2, uColor, smoothstep(0.0, 0.8, cloud)) * cloud + uColor2 * core * 0.35;
  gl_FragColor = vec4(col * uOpacity, 1.0);
}
`;
