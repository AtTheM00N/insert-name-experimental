export const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Maps v from [inMin,inMax] to [outMin,outMax], clamped. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  if (inMax === inMin) return outMin;
  return outMin + (clamp((v - inMin) / (inMax - inMin)) * (outMax - outMin));
};

/** Deterministic 32-bit hash → used to seed procedural frames so a given
 *  slug always renders the same image. */
export const hashString = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** Mulberry32 — tiny seeded PRNG. */
export const seededRandom = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pad2 = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Frames-per-second the studio cuts at. Shows up in every timecode. */
export const FILM_FPS = 24;

export const formatTimecode = (seconds: number, fps = FILM_FPS) => {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const f = Math.floor((total % 1) * fps);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(f)}`;
};

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Sanitises whatever a curious visitor types into the studio's blank.
 *  Uppercase, underscore-joined, hard length cap. */
export const toStudioName = (raw: string) => {
  const cleaned = raw
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N} _'&.-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return cleaned.slice(0, 18);
};
