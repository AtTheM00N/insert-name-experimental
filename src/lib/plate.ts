/* =========================================================================
   PLATE — INSERT_NAME's image treatment.
   Every picture on this site is generated: a scalar field, thresholded
   through an 8×8 Bayer matrix into one bit per pixel, then scaled up with
   nearest-neighbour so the pixels stay honest. It costs almost nothing,
   it never needs a stock library, and it is ours.
   ========================================================================= */

import { seededRandom } from "./utils";

export type TextureKind = "grid" | "scan" | "flow" | "grain" | "iris";

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

export type RGB = [number, number, number];

export const PALETTE = {
  bone: [244, 242, 237] as RGB,
  silver: [150, 148, 143] as RGB,
  signal: [100, 175, 219] as RGB,
  alert: [206, 24, 24] as RGB,
  dim: [70, 70, 72] as RGB,
};

type FieldFn = (x: number, y: number, t: number) => number;

/** Builds the scalar field for a texture family. x,y are normalised 0..1. */
const makeField = (kind: TextureKind, seed: number): FieldFn => {
  const rnd = seededRandom(seed);
  const a = 0.6 + rnd() * 2.4;
  const b = 0.6 + rnd() * 2.4;
  const c = rnd() * Math.PI * 2;
  const d = rnd() * Math.PI * 2;
  const skew = -0.4 + rnd() * 0.8;

  switch (kind) {
    /* Smoke / light through a room. Layered sines that never quite repeat. */
    case "flow":
      return (x, y, t) => {
        const u = x * 3.1 + skew * y;
        const v = y * 2.3;
        const s =
          Math.sin(u * a + t * 0.32 + c) * 0.5 +
          Math.sin(v * b - t * 0.21 + d) * 0.35 +
          Math.sin((u + v) * 1.7 + t * 0.13) * 0.28;
        const radial = 1 - Math.hypot(x - 0.5, (y - 0.5) * 1.25) * 1.5;
        return (s * 0.5 + 0.5) * 0.72 + radial * 0.42;
      };

    /* Broadcast bands — a signal arriving, not quite locked. */
    case "scan":
      return (x, y, t) => {
        const band = Math.sin(y * (14 + a * 9) - t * 0.9) * 0.5 + 0.5;
        const drift = Math.sin(x * 2.2 + t * 0.18 + c) * 0.2;
        const sweep = 1 - Math.min(1, Math.abs(((y + t * 0.06) % 1) - 0.5) * 3.4);
        return band * 0.52 + drift + sweep * 0.5 + (1 - Math.abs(x - 0.5)) * 0.24;
      };

    /* A floor receding into the dark. */
    case "grid":
      return (x, y, t) => {
        const depth = Math.pow(1 - y, 2.1) + 0.06;
        const gx = Math.abs((((x - 0.5) / depth) * 3 + 0.5) % 1) - 0.5;
        const gy = Math.abs(((y * 9 + t * 0.24) % 1) - 0.5);
        const line = Math.max(1 - Math.abs(gx) * 14 * depth, 1 - gy * 13);
        return Math.max(0, line) * (0.35 + y * 0.85) + (1 - y) * 0.12;
      };

    /* Exposed stock: dust, base fog, a hot centre. */
    case "grain":
      return (x, y, t) => {
        const n = Math.sin((x * 311.7 + y * 197.3 + t * 0.4) * 43758.5453);
        const noise = n - Math.floor(n);
        const cloud =
          Math.sin(x * 5.1 * a + t * 0.11) * 0.3 + Math.sin(y * 4.3 * b - t * 0.09) * 0.3;
        const radial = 1 - Math.hypot(x - 0.5, y - 0.52) * 1.7;
        return noise * 0.5 + cloud * 0.3 + radial * 0.7;
      };

    /* Aperture blades. Opens and closes very slowly. */
    case "iris":
    default:
      return (x, y, t) => {
        const dx = x - 0.5;
        const dy = (y - 0.5) * 1.02;
        const r = Math.hypot(dx, dy) * 2;
        const ang = Math.atan2(dy, dx);
        const blades = 7;
        const blade = Math.cos(ang * blades + t * 0.14 + c) * 0.06;
        const stop = 0.62 + Math.sin(t * 0.11) * 0.12;
        const edge = 1 - Math.abs(r - (stop + blade)) * 9;
        const inner = 1 - r * 1.35;
        return Math.max(edge, 0) * 0.9 + Math.max(inner, 0) * 0.5;
      };
  }
};

export type PlateOptions = {
  kind: TextureKind;
  seed: number;
  /** Seconds since the plate started drawing. */
  t: number;
  /** High colour and low colour of the duotone. */
  hi: RGB;
  lo: RGB;
  /** 0..1 — pushes the whole field brighter. */
  exposure?: number;
  /** 0..1 — how far the plate has developed in. Drives the reveal. */
  develop?: number;
};

/**
 * Draws one dithered plate into an existing ImageData-sized buffer.
 * `data` must be `cols * rows * 4` bytes.
 */
export function drawPlate(
  data: Uint8ClampedArray,
  cols: number,
  rows: number,
  opts: PlateOptions,
) {
  const { kind, seed, t, hi, lo, exposure = 0, develop = 1 } = opts;
  const field = makeField(kind, seed);
  const dev = Math.max(0, Math.min(1, develop));

  for (let y = 0; y < rows; y += 1) {
    const ny = y / (rows - 1 || 1);
    const bayerRow = BAYER8[y & 7]!;

    for (let x = 0; x < cols; x += 1) {
      const nx = x / (cols - 1 || 1);
      const i = (y * cols + x) * 4;

      let v = field(nx, ny, t) + exposure;

      // Development wipes in from the left with a soft, noisy edge, so the
      // plate looks chemically exposed rather than CSS-animated.
      if (dev < 1) {
        const edge = (nx - (dev * 1.35 - 0.2)) * 3.2;
        v -= Math.max(0, edge);
      }

      const threshold = bayerRow[x & 7]!;

      let r = 0;
      let g = 0;
      let b = 0;
      let alpha = 0;

      if (v > threshold + 0.34) {
        [r, g, b] = hi;
        alpha = 255;
      } else if (v > threshold - 0.04) {
        [r, g, b] = lo;
        alpha = 255;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = alpha;
    }
  }
}

/** Chunk size for the plate grid. Fewer columns = chunkier pixels. */
export const plateResolution = (width: number, chunk = 7) => {
  const cols = Math.round(width / chunk);
  return Math.max(48, Math.min(240, cols));
};
