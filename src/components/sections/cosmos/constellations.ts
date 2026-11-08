/**
 * Real constellation figures for the Cosmos section.
 *
 * Star positions are J2000 right ascension (decimal hours) and declination
 * (decimal degrees) of the naked-eye stars that make up each classic stick
 * figure; magnitudes are apparent visual magnitudes (rounded). Line pairs
 * follow the usual planetarium figures.
 *
 * Sky frame (shared by the WebGL scene and the SVG glyphs):
 *   +Y = north celestial pole, RA 0h = +X, RA increases toward −Z, so seen
 *   from the centre of the sphere east is to the LEFT, exactly like the real sky.
 */

export type Star = {
  id: string;
  /** Proper name or Bayer designation, for tooltips / screen readers. */
  name: string;
  /** Right ascension, decimal hours (J2000). */
  ra: number;
  /** Declination, decimal degrees (J2000). */
  dec: number;
  /** Apparent visual magnitude. */
  mag: number;
};

export type ConstellationDef = {
  name: string;
  /** IAU three-letter abbreviation. */
  abbr: string;
  /** Plain-English meaning of the name. */
  meaning: string;
  stars: Star[];
  /** Stick-figure segments, listed in draw-in order. */
  lines: [string, string][];
};

const deg = Math.PI / 180;

/** Unit vector for an RA/Dec pair in the sky frame described above. */
export function raDecToVec(ra: number, dec: number): [number, number, number] {
  const a = ra * 15 * deg;
  const d = dec * deg;
  const c = Math.cos(d);
  return [c * Math.cos(a), Math.sin(d), -c * Math.sin(a)];
}

export const CONSTELLATIONS: Record<string, ConstellationDef> = {
  Aquila: {
    name: "Aquila",
    abbr: "Aql",
    meaning: "The Eagle",
    stars: [
      { id: "altair", name: "Altair (α Aql)", ra: 19.8464, dec: 8.8683, mag: 0.76 },
      { id: "tarazed", name: "Tarazed (γ Aql)", ra: 19.771, dec: 10.6133, mag: 2.72 },
      { id: "alshain", name: "Alshain (β Aql)", ra: 19.9219, dec: 6.4068, mag: 3.71 },
      { id: "okab", name: "Okab (ζ Aql)", ra: 19.0902, dec: 13.8634, mag: 2.99 },
      { id: "epsilon", name: "ε Aql", ra: 18.9937, dec: 15.0683, mag: 4.02 },
      { id: "delta", name: "δ Aql", ra: 19.425, dec: 3.1148, mag: 3.36 },
      { id: "lambda", name: "Al Thalimain (λ Aql)", ra: 19.1041, dec: -4.8826, mag: 3.43 },
      { id: "eta", name: "η Aql", ra: 19.8746, dec: 1.0057, mag: 3.87 },
      { id: "theta", name: "θ Aql", ra: 20.1884, dec: -0.8215, mag: 3.26 },
    ],
    lines: [
      ["tarazed", "altair"],
      ["altair", "alshain"],
      ["altair", "delta"],
      ["delta", "lambda"],
      ["delta", "okab"],
      ["okab", "epsilon"],
      ["altair", "eta"],
      ["eta", "theta"],
    ],
  },
  Gemini: {
    name: "Gemini",
    abbr: "Gem",
    meaning: "The Twins",
    stars: [
      { id: "castor", name: "Castor (α Gem)", ra: 7.5766, dec: 31.8883, mag: 1.58 },
      { id: "pollux", name: "Pollux (β Gem)", ra: 7.7553, dec: 28.0262, mag: 1.14 },
      { id: "alhena", name: "Alhena (γ Gem)", ra: 6.6285, dec: 16.3993, mag: 1.92 },
      { id: "wasat", name: "Wasat (δ Gem)", ra: 7.3354, dec: 21.9823, mag: 3.53 },
      { id: "mebsuta", name: "Mebsuta (ε Gem)", ra: 6.7322, dec: 25.1311, mag: 2.98 },
      { id: "tejat", name: "Tejat (μ Gem)", ra: 6.3827, dec: 22.5136, mag: 2.88 },
      { id: "propus", name: "Propus (η Gem)", ra: 6.2479, dec: 22.5068, mag: 3.28 },
      { id: "mekbuda", name: "Mekbuda (ζ Gem)", ra: 7.0685, dec: 20.5703, mag: 3.93 },
      { id: "alzirr", name: "Alzirr (ξ Gem)", ra: 6.7548, dec: 12.8956, mag: 3.36 },
      { id: "tau", name: "τ Gem", ra: 7.1857, dec: 30.2452, mag: 4.41 },
      { id: "theta", name: "θ Gem", ra: 6.8798, dec: 33.9611, mag: 3.6 },
      { id: "iota", name: "ι Gem", ra: 7.4288, dec: 27.7981, mag: 3.79 },
      { id: "upsilon", name: "υ Gem", ra: 7.5987, dec: 26.8958, mag: 4.06 },
      { id: "kappa", name: "κ Gem", ra: 7.7408, dec: 24.398, mag: 3.57 },
      { id: "lambda", name: "λ Gem", ra: 7.3016, dec: 16.5403, mag: 3.58 },
    ],
    lines: [
      ["castor", "tau"],
      ["tau", "theta"],
      ["tau", "mebsuta"],
      ["mebsuta", "tejat"],
      ["tejat", "propus"],
      ["tau", "iota"],
      ["iota", "upsilon"],
      ["upsilon", "pollux"],
      ["pollux", "kappa"],
      ["upsilon", "wasat"],
      ["wasat", "mekbuda"],
      ["mekbuda", "alhena"],
      ["wasat", "lambda"],
      ["lambda", "alzirr"],
    ],
  },
  Orion: {
    name: "Orion",
    abbr: "Ori",
    meaning: "The Hunter",
    stars: [
      { id: "betelgeuse", name: "Betelgeuse (α Ori)", ra: 5.9195, dec: 7.4069, mag: 0.5 },
      { id: "rigel", name: "Rigel (β Ori)", ra: 5.2423, dec: -8.2016, mag: 0.13 },
      { id: "bellatrix", name: "Bellatrix (γ Ori)", ra: 5.4189, dec: 6.3497, mag: 1.64 },
      { id: "mintaka", name: "Mintaka (δ Ori)", ra: 5.5334, dec: -0.2991, mag: 2.23 },
      { id: "alnilam", name: "Alnilam (ε Ori)", ra: 5.6036, dec: -1.2019, mag: 1.69 },
      { id: "alnitak", name: "Alnitak (ζ Ori)", ra: 5.6793, dec: -1.9426, mag: 1.77 },
      { id: "saiph", name: "Saiph (κ Ori)", ra: 5.7959, dec: -9.6696, mag: 2.06 },
      { id: "meissa", name: "Meissa (λ Ori)", ra: 5.5856, dec: 9.9342, mag: 3.39 },
      { id: "hatysa", name: "Hatysa (ι Ori)", ra: 5.5906, dec: -5.9099, mag: 2.77 },
      { id: "pi3", name: "Tabit (π³ Ori)", ra: 4.8306, dec: 6.9613, mag: 3.19 },
      { id: "pi2", name: "π² Ori", ra: 4.8436, dec: 8.9003, mag: 4.35 },
      { id: "pi4", name: "π⁴ Ori", ra: 4.8534, dec: 5.6051, mag: 3.68 },
      { id: "mu", name: "μ Ori", ra: 6.0397, dec: 9.6475, mag: 4.12 },
      { id: "xi", name: "ξ Ori", ra: 6.1989, dec: 14.2088, mag: 4.45 },
    ],
    lines: [
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["mintaka", "bellatrix"],
      ["bellatrix", "meissa"],
      ["meissa", "betelgeuse"],
      ["betelgeuse", "alnitak"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["alnilam", "hatysa"],
      ["bellatrix", "pi3"],
      ["pi3", "pi2"],
      ["pi3", "pi4"],
      ["betelgeuse", "mu"],
      ["mu", "xi"],
    ],
  },
  Crux: {
    name: "Crux",
    abbr: "Cru",
    meaning: "The Southern Cross",
    stars: [
      { id: "acrux", name: "Acrux (α Cru)", ra: 12.4433, dec: -63.0991, mag: 0.76 },
      { id: "mimosa", name: "Mimosa (β Cru)", ra: 12.7954, dec: -59.6888, mag: 1.25 },
      { id: "gacrux", name: "Gacrux (γ Cru)", ra: 12.5194, dec: -57.1132, mag: 1.63 },
      { id: "imai", name: "Imai (δ Cru)", ra: 12.2524, dec: -58.7489, mag: 2.79 },
      { id: "ginan", name: "Ginan (ε Cru)", ra: 12.356, dec: -60.4011, mag: 3.59 },
    ],
    lines: [
      ["gacrux", "acrux"],
      ["imai", "mimosa"],
    ],
  },
  Scorpius: {
    name: "Scorpius",
    abbr: "Sco",
    meaning: "The Scorpion",
    stars: [
      { id: "antares", name: "Antares (α Sco)", ra: 16.4901, dec: -26.432, mag: 1.06 },
      { id: "graffias", name: "Acrab (β¹ Sco)", ra: 16.0906, dec: -19.8055, mag: 2.62 },
      { id: "dschubba", name: "Dschubba (δ Sco)", ra: 16.0056, dec: -22.6217, mag: 2.29 },
      { id: "pi", name: "Fang (π Sco)", ra: 15.9809, dec: -26.1141, mag: 2.89 },
      { id: "sigma", name: "Alniyat (σ Sco)", ra: 16.3531, dec: -25.5928, mag: 2.89 },
      { id: "tau", name: "Paikauhale (τ Sco)", ra: 16.598, dec: -28.216, mag: 2.82 },
      { id: "epsilon", name: "Larawag (ε Sco)", ra: 16.836, dec: -34.2932, mag: 2.29 },
      { id: "mu1", name: "Xamidimura (μ¹ Sco)", ra: 16.8645, dec: -38.0474, mag: 3.0 },
      { id: "zeta2", name: "ζ² Sco", ra: 16.9097, dec: -42.3613, mag: 3.62 },
      { id: "eta", name: "η Sco", ra: 17.2026, dec: -43.2392, mag: 3.33 },
      { id: "sargas", name: "Sargas (θ Sco)", ra: 17.622, dec: -42.9978, mag: 1.86 },
      { id: "iota1", name: "ι¹ Sco", ra: 17.793, dec: -40.127, mag: 2.99 },
      { id: "kappa", name: "Girtab (κ Sco)", ra: 17.708, dec: -39.03, mag: 2.39 },
      { id: "shaula", name: "Shaula (λ Sco)", ra: 17.5601, dec: -37.1038, mag: 1.62 },
      { id: "lesath", name: "Lesath (υ Sco)", ra: 17.5127, dec: -37.2958, mag: 2.7 },
    ],
    lines: [
      ["graffias", "dschubba"],
      ["dschubba", "pi"],
      ["dschubba", "sigma"],
      ["sigma", "antares"],
      ["antares", "tau"],
      ["tau", "epsilon"],
      ["epsilon", "mu1"],
      ["mu1", "zeta2"],
      ["zeta2", "eta"],
      ["eta", "sargas"],
      ["sargas", "iota1"],
      ["iota1", "kappa"],
      ["kappa", "shaula"],
      ["shaula", "lesath"],
    ],
  },
  "Ursa Major": {
    name: "Ursa Major",
    abbr: "UMa",
    meaning: "The Great Bear",
    stars: [
      { id: "dubhe", name: "Dubhe (α UMa)", ra: 11.0621, dec: 61.7511, mag: 1.79 },
      { id: "merak", name: "Merak (β UMa)", ra: 11.0307, dec: 56.3824, mag: 2.37 },
      { id: "phecda", name: "Phecda (γ UMa)", ra: 11.8972, dec: 53.6948, mag: 2.44 },
      { id: "megrez", name: "Megrez (δ UMa)", ra: 12.257, dec: 57.0326, mag: 3.31 },
      { id: "alioth", name: "Alioth (ε UMa)", ra: 12.9005, dec: 55.9598, mag: 1.77 },
      { id: "mizar", name: "Mizar (ζ UMa)", ra: 13.3988, dec: 54.9254, mag: 2.27 },
      { id: "alkaid", name: "Alkaid (η UMa)", ra: 13.7923, dec: 49.3133, mag: 1.86 },
      { id: "h", name: "h UMa", ra: 9.5255, dec: 63.0619, mag: 3.65 },
      { id: "muscida", name: "Muscida (ο UMa)", ra: 8.5044, dec: 60.7182, mag: 3.36 },
      { id: "theta", name: "θ UMa", ra: 9.5476, dec: 51.6773, mag: 3.17 },
      { id: "talitha", name: "Talitha (ι UMa)", ra: 8.9868, dec: 48.0418, mag: 3.14 },
      { id: "chi", name: "Alkafzah (χ UMa)", ra: 11.7675, dec: 47.7794, mag: 3.69 },
      { id: "psi", name: "ψ UMa", ra: 11.161, dec: 44.4985, mag: 3.0 },
      { id: "mu", name: "Tania Australis (μ UMa)", ra: 10.3721, dec: 41.4995, mag: 3.06 },
      { id: "nu", name: "Alula Borealis (ν UMa)", ra: 11.308, dec: 33.0943, mag: 3.49 },
    ],
    lines: [
      ["alkaid", "mizar"],
      ["mizar", "alioth"],
      ["alioth", "megrez"],
      ["megrez", "dubhe"],
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["dubhe", "h"],
      ["h", "muscida"],
      ["merak", "theta"],
      ["theta", "talitha"],
      ["phecda", "chi"],
      ["chi", "psi"],
      ["psi", "mu"],
      ["chi", "nu"],
    ],
  },
  Cassiopeia: {
    name: "Cassiopeia",
    abbr: "Cas",
    meaning: "The Queen",
    stars: [
      { id: "caph", name: "Caph (β Cas)", ra: 0.153, dec: 59.1498, mag: 2.27 },
      { id: "schedar", name: "Schedar (α Cas)", ra: 0.6751, dec: 56.5373, mag: 2.24 },
      { id: "navi", name: "Navi (γ Cas)", ra: 0.9451, dec: 60.7167, mag: 2.15 },
      { id: "ruchbah", name: "Ruchbah (δ Cas)", ra: 1.4303, dec: 60.2353, mag: 2.68 },
      { id: "segin", name: "Segin (ε Cas)", ra: 1.9066, dec: 63.67, mag: 3.38 },
    ],
    lines: [
      ["caph", "schedar"],
      ["schedar", "navi"],
      ["navi", "ruchbah"],
      ["ruchbah", "segin"],
    ],
  },
  Lyra: {
    name: "Lyra",
    abbr: "Lyr",
    meaning: "The Lyre",
    stars: [
      { id: "vega", name: "Vega (α Lyr)", ra: 18.6156, dec: 38.7837, mag: 0.03 },
      { id: "epsilon", name: "ε Lyr", ra: 18.739, dec: 39.67, mag: 4.6 },
      { id: "zeta", name: "ζ¹ Lyr", ra: 18.7462, dec: 37.605, mag: 4.36 },
      { id: "sheliak", name: "Sheliak (β Lyr)", ra: 18.8347, dec: 33.3627, mag: 3.52 },
      { id: "sulafat", name: "Sulafat (γ Lyr)", ra: 18.9824, dec: 32.6896, mag: 3.25 },
      { id: "delta2", name: "δ² Lyr", ra: 18.9084, dec: 36.8986, mag: 4.3 },
    ],
    lines: [
      ["vega", "epsilon"],
      ["epsilon", "zeta"],
      ["zeta", "vega"],
      ["zeta", "sheliak"],
      ["sheliak", "sulafat"],
      ["sulafat", "delta2"],
      ["delta2", "zeta"],
    ],
  },
  Cygnus: {
    name: "Cygnus",
    abbr: "Cyg",
    meaning: "The Swan",
    stars: [
      { id: "deneb", name: "Deneb (α Cyg)", ra: 20.6905, dec: 45.2803, mag: 1.25 },
      { id: "sadr", name: "Sadr (γ Cyg)", ra: 20.3705, dec: 40.2567, mag: 2.23 },
      { id: "eta", name: "η Cyg", ra: 19.9384, dec: 35.0834, mag: 3.89 },
      { id: "albireo", name: "Albireo (β Cyg)", ra: 19.512, dec: 27.9597, mag: 3.08 },
      { id: "fawaris", name: "Fawaris (δ Cyg)", ra: 19.7496, dec: 45.1308, mag: 2.87 },
      { id: "iota", name: "ι Cyg", ra: 19.495, dec: 51.7298, mag: 3.79 },
      { id: "kappa", name: "κ Cyg", ra: 19.285, dec: 53.3686, mag: 3.8 },
      { id: "gienah", name: "Aljanah (ε Cyg)", ra: 20.7702, dec: 33.9703, mag: 2.48 },
      { id: "zeta", name: "ζ Cyg", ra: 21.2156, dec: 30.227, mag: 3.2 },
    ],
    lines: [
      ["deneb", "sadr"],
      ["sadr", "eta"],
      ["eta", "albireo"],
      ["sadr", "fawaris"],
      ["fawaris", "iota"],
      ["iota", "kappa"],
      ["sadr", "gienah"],
      ["gienah", "zeta"],
    ],
  },
  Leo: {
    name: "Leo",
    abbr: "Leo",
    meaning: "The Lion",
    stars: [
      { id: "regulus", name: "Regulus (α Leo)", ra: 10.1395, dec: 11.9672, mag: 1.35 },
      { id: "eta", name: "η Leo", ra: 10.1222, dec: 16.7627, mag: 3.48 },
      { id: "algieba", name: "Algieba (γ Leo)", ra: 10.3329, dec: 19.8415, mag: 2.08 },
      { id: "adhafera", name: "Adhafera (ζ Leo)", ra: 10.2782, dec: 23.4173, mag: 3.44 },
      { id: "rasalas", name: "Rasalas (μ Leo)", ra: 9.8794, dec: 26.007, mag: 3.88 },
      { id: "epsilon", name: "Ras Elased (ε Leo)", ra: 9.7642, dec: 23.7743, mag: 2.98 },
      { id: "zosma", name: "Zosma (δ Leo)", ra: 11.2351, dec: 20.5237, mag: 2.56 },
      { id: "denebola", name: "Denebola (β Leo)", ra: 11.8177, dec: 14.5721, mag: 2.13 },
      { id: "chertan", name: "Chertan (θ Leo)", ra: 11.2373, dec: 15.4296, mag: 3.33 },
    ],
    lines: [
      ["regulus", "eta"],
      ["eta", "algieba"],
      ["algieba", "adhafera"],
      ["adhafera", "rasalas"],
      ["rasalas", "epsilon"],
      ["algieba", "zosma"],
      ["zosma", "denebola"],
      ["denebola", "chertan"],
      ["chertan", "regulus"],
    ],
  },
};

/** Mean direction of a constellation's stars (unit vector). */
export function centroidOf(def: ConstellationDef): [number, number, number] {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const s of def.stars) {
    const v = raDecToVec(s.ra, s.dec);
    x += v[0];
    y += v[1];
    z += v[2];
  }
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

/** Format a unit direction as "RA 05h 35m · Dec −01°". */
export function formatRaDec(x: number, y: number, z: number) {
  const dec = Math.asin(Math.max(-1, Math.min(1, y))) / deg;
  let ra = Math.atan2(-z, x) / (15 * deg);
  if (ra < 0) ra += 24;
  let h = Math.floor(ra);
  let m = Math.round((ra - h) * 60);
  if (m === 60) {
    m = 0;
    h = (h + 1) % 24;
  }
  const sign = dec < 0 ? "−" : "+";
  const d = Math.round(Math.abs(dec));
  return {
    ra: `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`,
    dec: `${sign}${String(d).padStart(2, "0")}°`,
  };
}

/**
 * Gnomonic (tangent-plane) projection of a constellation around its centroid,
 * oriented north-up / east-left like the sky. Returns 2D points (y down) fitted
 * into a `size`×`size` box with `pad` padding, plus resolved line index pairs.
 */
export function projectConstellation(def: ConstellationDef, size = 100, pad = 10) {
  const f = centroidOf(def);
  // right = f × up(0,1,0) ; up' = right × f
  let rx = -f[2];
  let ry = 0;
  let rz = f[0];
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl;
  ry /= rl;
  rz /= rl;
  const ux = ry * f[2] - rz * f[1];
  const uy = rz * f[0] - rx * f[2];
  const uz = rx * f[1] - ry * f[0];
  const raw = def.stars.map((s) => {
    const v = raDecToVec(s.ra, s.dec);
    const dz = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
    return {
      x: (v[0] * rx + v[1] * ry + v[2] * rz) / dz,
      y: -(v[0] * ux + v[1] * uy + v[2] * uz) / dz,
    };
  });
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of raw) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const k = (size - pad * 2) / span;
  const ox = (size - (maxX - minX) * k) / 2;
  const oy = (size - (maxY - minY) * k) / 2;
  const points = raw.map((p, i) => ({
    x: ox + (p.x - minX) * k,
    y: oy + (p.y - minY) * k,
    mag: def.stars[i].mag,
  }));
  const index = new Map(def.stars.map((s, i) => [s.id, i]));
  const lines = def.lines
    .map(([a, b]) => [index.get(a), index.get(b)] as const)
    .filter((l): l is readonly [number, number] => l[0] !== undefined && l[1] !== undefined);
  return { points, lines };
}
