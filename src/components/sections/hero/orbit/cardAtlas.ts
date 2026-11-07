/**
 * Draws every orbit card (navy card, hackvidia tile motif, mono category,
 * title, tagline, metric, optional project photo) into ONE canvas atlas so
 * the whole ring renders as a single instanced draw call.
 *
 * Browser-only: called from the dynamically imported scene.
 */

export type AtlasCard = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  accent: string;
  context: string;
  metric?: { value: string; label: string };
  image?: string;
};

export type Atlas = {
  canvas: HTMLCanvasElement;
  /** Per card: u, v, width, height (UV space, v from bottom). */
  uvs: Float32Array;
};

/** Logical card size; the atlas is drawn at `scale` of this. 3:4 like the BEM UI orbit cards. */
const CW = 540;
const CH = 720;

const NAVY_950 = "#05081a";
const NAVY_900 = "#0b102d";
const NAVY_800 = "#141d48";
const NAVY_700 = "#1c2860";
const PRIMARY = "#2f4199";
const SKY = "#4f8bff";
const SAFFRON = "#f5c04a";
const CORAL = "#d64c6f";

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Accent tuned for legibility on navy: dark accents (primary, BEM blue) are lifted toward white. */
export function readableAccent(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum > 0.45) return hex;
  const k = Math.min(0.6, 0.45 - lum + 0.3);
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Deterministic PRNG from a string (so a project's tile motif never changes). */
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** One hackvidia-style tile (quarter circles, half discs, triangles, rings, split squares). */
function drawTile(g: CanvasRenderingContext2D, x: number, y: number, s: number, kind: number, rot: number, fg: string, bg: string | null) {
  g.save();
  g.translate(x + s / 2, y + s / 2);
  g.rotate((rot * Math.PI) / 2);
  g.translate(-s / 2, -s / 2);
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, s, s);
  }
  g.fillStyle = fg;
  g.beginPath();
  switch (kind % 7) {
    case 0: // quarter disc
      g.moveTo(0, 0);
      g.lineTo(s, 0);
      g.arc(0, 0, s, 0, Math.PI / 2);
      g.closePath();
      g.fill();
      break;
    case 1: // triangle half
      g.moveTo(0, 0);
      g.lineTo(s, 0);
      g.lineTo(0, s);
      g.closePath();
      g.fill();
      break;
    case 2: // circle
      g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
      g.fill();
      break;
    case 3: // ring
      g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
      g.arc(s / 2, s / 2, s / 4, 0, Math.PI * 2, true);
      g.fill("evenodd");
      break;
    case 4: // half disc on an edge
      g.arc(s / 2, s, s / 2, Math.PI, 0);
      g.closePath();
      g.fill();
      break;
    case 5: // concave corner (square minus quarter disc)
      g.moveTo(0, 0);
      g.lineTo(s, 0);
      g.lineTo(s, s);
      g.arc(s, s, s, Math.PI * 1.5, Math.PI, true);
      g.closePath();
      g.fill();
      break;
    default: // diamond
      g.moveTo(s / 2, 0);
      g.lineTo(s, s / 2);
      g.lineTo(s / 2, s);
      g.lineTo(0, s / 2);
      g.closePath();
      g.fill();
  }
  g.restore();
}

/** Full generative mosaic used as the cover of projects without a photo. */
function drawMosaic(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, card: AtlasCard) {
  const rand = rng(card.slug);
  const palette = [card.accent, card.accent, PRIMARY, SKY, SAFFRON, CORAL, NAVY_700];
  const cols = 4;
  const s = w / cols;
  const rows = Math.ceil(h / s);
  g.save();
  g.fillStyle = NAVY_800;
  g.fillRect(x, y, w, h);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rand() < 0.16) continue; // breathing room, like the reference mosaics
      const fg = palette[Math.floor(rand() * palette.length)];
      const bg = rand() < 0.35 ? palette[Math.floor(rand() * palette.length)] : null;
      g.globalAlpha = 0.55 + rand() * 0.45;
      drawTile(g, x + c * s, y + r * s, s, Math.floor(rand() * 7), Math.floor(rand() * 4), fg, bg === fg ? null : bg);
    }
  }
  g.globalAlpha = 1;
  // soft navy wash so the mosaic reads as texture behind the title
  const wash = g.createLinearGradient(0, y, 0, y + h);
  wash.addColorStop(0, rgba(NAVY_900, 0.05));
  wash.addColorStop(1, rgba(NAVY_900, 0.55));
  g.fillStyle = wash;
  g.fillRect(x, y, w, h);
  g.restore();
}

/** Word-wrap into at most `maxLines`, ellipsising the last line. */
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (g.measureText(test).width <= maxW || !line) {
      line = test;
    } else {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) {
        line = "";
        // ellipsise the last kept line
        let last = lines[maxLines - 1];
        while (last.length && g.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
        lines[maxLines - 1] = `${last.replace(/[\s,.;:—-]+$/, "")}…`;
        return lines;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCard(g: CanvasRenderingContext2D, card: AtlasCard, img: HTMLImageElement | null, sans: string, mono: string, index: number, total: number) {
  const accent = readableAccent(card.accent);
  const pad = 8; // transparent gutter (mipmap bleed + rounded corners)
  const x0 = pad;
  const y0 = pad;
  const w = CW - pad * 2;
  const h = CH - pad * 2;
  const R = 34;

  /* --- card body --- */
  g.save();
  roundRect(g, x0, y0, w, h, R);
  g.clip();
  const body = g.createLinearGradient(0, y0, 0, y0 + h);
  body.addColorStop(0, NAVY_800);
  body.addColorStop(0.55, NAVY_900);
  body.addColorStop(1, NAVY_950);
  g.fillStyle = body;
  g.fillRect(x0, y0, w, h);
  const glow = g.createRadialGradient(x0 + w * 0.9, y0 + h * 0.62, 0, x0 + w * 0.9, y0 + h * 0.62, w * 0.9);
  glow.addColorStop(0, rgba(card.accent, 0.28));
  glow.addColorStop(1, rgba(card.accent, 0));
  g.fillStyle = glow;
  g.fillRect(x0, y0, w, h);

  // faint dot grid (DotGrid language)
  g.fillStyle = "rgba(255,255,255,0.045)";
  for (let yy = y0 + 330; yy < y0 + h; yy += 18) for (let xx = x0 + 12; xx < x0 + w; xx += 18) g.fillRect(xx, yy, 2, 2);

  /* --- cover --- */
  const cx = x0 + 20;
  const cy = y0 + 20;
  const cw = w - 40;
  const ch = 272;
  g.save();
  roundRect(g, cx, cy, cw, ch, 22);
  g.clip();
  if (img && img.naturalWidth > 0) {
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    g.drawImage(img, cx + (cw - dw) / 2, cy + (ch - dh) / 2, dw, dh);
    const tint = g.createLinearGradient(0, cy, 0, cy + ch);
    tint.addColorStop(0, rgba(NAVY_900, 0));
    tint.addColorStop(0.6, rgba(NAVY_900, 0.08));
    tint.addColorStop(1, rgba(NAVY_900, 0.7));
    g.fillStyle = tint;
    g.fillRect(cx, cy, cw, ch);
  } else {
    drawMosaic(g, cx, cy, cw, ch, card);
  }
  g.restore();
  // hairline around the cover
  g.strokeStyle = "rgba(255,255,255,0.10)";
  g.lineWidth = 2;
  roundRect(g, cx + 1, cy + 1, cw - 2, ch - 2, 21);
  g.stroke();

  // tile badge (hackvidia cluster) in the cover's top-right corner
  const t = 34;
  const bx = cx + cw - t * 3 - 14;
  const by = cy + 14;
  drawTile(g, bx, by, t, 0, 1, card.accent, NAVY_900);
  drawTile(g, bx + t, by, t, 1, 0, SAFFRON, PRIMARY);
  drawTile(g, bx + t * 2, by, t, 2, 0, SKY, NAVY_900);

  // index chip, top-left
  g.font = `500 17px ${mono}`;
  const idx = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
  const iw = g.measureText(idx).width + 22;
  g.fillStyle = rgba(NAVY_950, 0.72);
  roundRect(g, cx + 14, cy + 14, iw, 34, 17);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.textBaseline = "middle";
  g.fillText(idx, cx + 25, cy + 32);

  /* --- copy --- */
  const tx = x0 + 30;
  const tw = w - 60;
  let y = cy + ch + 40;
  g.textBaseline = "alphabetic";
  g.font = `500 17px ${mono}`;
  g.fillStyle = accent;
  g.fillText(`// ${card.category.toUpperCase()}`, tx, y);
  g.fillStyle = "rgba(255,255,255,0.4)";
  const yr = card.year;
  g.fillText(yr, tx + tw - g.measureText(yr).width, y);

  y += 50;
  g.font = `800 42px ${sans}`;
  g.fillStyle = "#ffffff";
  const titleLines = wrap(g, card.title, tw, 2);
  titleLines.forEach((l, i) => g.fillText(l, tx, y + i * 46));
  y += (titleLines.length - 1) * 46 + 40;

  g.font = `400 21px ${sans}`;
  g.fillStyle = "rgba(255,255,255,0.66)";
  const tagLines = wrap(g, card.tagline, tw, titleLines.length > 1 ? 2 : 3);
  tagLines.forEach((l, i) => g.fillText(l, tx, y + i * 29));

  /* --- footer --- */
  const fy = y0 + h - 92;
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.fillRect(tx, fy, tw, 2);
  if (card.metric) {
    g.font = `800 38px ${sans}`;
    g.fillStyle = accent;
    g.fillText(card.metric.value, tx, fy + 56);
    const mw = g.measureText(card.metric.value).width;
    g.font = `500 15px ${mono}`;
    g.fillStyle = "rgba(255,255,255,0.55)";
    const lbl = wrap(g, card.metric.label.toUpperCase(), tw - mw - 96, 2);
    lbl.forEach((l, i) => g.fillText(l, tx + mw + 14, fy + (lbl.length > 1 ? 38 : 50) + i * 19));
  } else {
    g.font = `500 15px ${mono}`;
    g.fillStyle = "rgba(255,255,255,0.55)";
    const lbl = wrap(g, card.context.toUpperCase(), tw - 80, 2);
    lbl.forEach((l, i) => g.fillText(l, tx, fy + (lbl.length > 1 ? 38 : 50) + i * 19));
  }
  // arrow button
  const ax = tx + tw - 24;
  const ay = fy + 46;
  g.strokeStyle = rgba(accent, 0.9);
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(ax, ay, 24, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(ax - 7, ay + 7);
  g.lineTo(ax + 7, ay - 7);
  g.moveTo(ax - 4, ay - 7);
  g.lineTo(ax + 7, ay - 7);
  g.lineTo(ax + 7, ay + 4);
  g.stroke();

  g.restore(); // body clip

  /* --- frame --- */
  roundRect(g, x0 + 1, y0 + 1, w - 2, h - 2, R - 1);
  g.lineWidth = 2;
  const frame = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
  frame.addColorStop(0, rgba(accent, 0.75));
  frame.addColorStop(0.5, "rgba(255,255,255,0.08)");
  frame.addColorStop(1, rgba(accent, 0.35));
  g.strokeStyle = frame;
  g.stroke();
  // accent bar on the left edge
  g.fillStyle = card.accent;
  roundRect(g, x0 + 2, y0 + 110, 5, 90, 2.5);
  g.fill();
}

function fontFamily(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

export async function buildCardAtlas(cards: AtlasCard[], resolve: (p: string) => string, scale = 1): Promise<Atlas> {
  const sans = fontFamily("--font-jakarta", '"Plus Jakarta Sans", system-ui, sans-serif');
  const mono = fontFamily("--font-mono-jb", '"JetBrains Mono", ui-monospace, monospace');
  // Make sure the web fonts are ready before rasterising text (with a timeout so we never hang).
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`800 42px ${sans}`),
        document.fonts.load(`400 21px ${sans}`),
        document.fonts.load(`500 17px ${mono}`),
      ]),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch {
    /* fall back to whatever is available */
  }

  const imgs = await Promise.all(cards.map((c) => (c.image ? loadImage(resolve(c.image)) : Promise.resolve(null))));

  const n = Math.max(1, cards.length);
  const cols = Math.min(5, n);
  const rows = Math.ceil(n / cols);
  const s = Math.min(scale, 4096 / (cols * CW), 4096 / (rows * CH));
  const cw = Math.floor(CW * s);
  const ch = Math.floor(CH * s);
  const W = cols * cw;
  const H = rows * ch;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const uvs = new Float32Array(n * 4);
  if (!g) return { canvas, uvs };

  cards.forEach((card, i) => {
    const x = (i % cols) * cw;
    const y = Math.floor(i / cols) * ch;
    g.save();
    g.translate(x, y);
    g.scale(cw / CW, ch / CH);
    drawCard(g, card, imgs[i], sans, mono, i, cards.length);
    g.restore();
    uvs[i * 4] = x / W;
    uvs[i * 4 + 1] = 1 - (y + ch) / H;
    uvs[i * 4 + 2] = cw / W;
    uvs[i * 4 + 3] = ch / H;
  });
  return { canvas, uvs };
}
