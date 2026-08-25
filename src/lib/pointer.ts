/* =========================================================================
   THE LIGHT — one source of truth for where it is.

   Every consumer on this site wants the same two numbers, and before this
   module each of them went and asked the DOM: getComputedStyle(:root) twice
   a frame, per element, at display rate. That is the single most expensive
   thing a decorative effect can do, and it scaled with the number of
   effects.

   So: one rAF loop, one object, a subscriber list. The loop only exists
   while something is listening, it stops when the tab goes away, and CSS
   variables are written by exactly one subscriber (PointerField) and only
   when a value has actually changed enough to matter.

   Everything downstream reads `pointer` — a plain object, free to touch.
   ========================================================================= */

export type Pointer = {
  /** Viewport pixels, eased. This is the light, not the cursor. */
  x: number;
  y: number;
  /** The same, normalised 0..1 against the viewport. */
  nx: number;
  ny: number;
  /** Raw cursor, un-eased — for anything that must feel instant. */
  rawX: number;
  rawY: number;
  /** 1 while a real pointer is over the document. */
  inside: number;
  /** 1 while the light is wandering on its own. */
  idle: number;
  /** Speed of the light in px/frame — drives smear and weight. */
  speed: number;
};

const SSR = typeof window === "undefined";

export const pointer: Pointer = {
  x: SSR ? 0 : window.innerWidth * 0.5,
  y: SSR ? 0 : window.innerHeight * 0.42,
  nx: 0.5,
  ny: 0.42,
  rawX: SSR ? 0 : window.innerWidth * 0.5,
  rawY: SSR ? 0 : window.innerHeight * 0.42,
  inside: 0,
  idle: 1,
  speed: 0,
};

type Listener = (p: Pointer) => void;

const listeners = new Set<Listener>();

let raf = 0;
let bound = false;
let still = false; /* reduced motion: placed, never eased, never drifting */

let tx = pointer.x;
let ty = pointer.y;
let idleSince = 0;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

const onMove = (e: PointerEvent) => {
  tx = e.clientX;
  ty = e.clientY;
  pointer.rawX = tx;
  pointer.rawY = ty;
  idleSince = performance.now();
  pointer.inside = 1;
  if (still) {
    pointer.x = tx;
    pointer.y = ty;
    pointer.nx = tx / Math.max(1, window.innerWidth);
    pointer.ny = ty / Math.max(1, window.innerHeight);
    pointer.idle = 0;
    emit();
  }
};

const onLeave = () => {
  pointer.inside = 0;
  idleSince = 0; /* hand it straight back to the drift */
};

const emit = () => {
  for (const fn of listeners) fn(pointer);
};

const frame = (now: number) => {
  raf = requestAnimationFrame(frame);

  /* After two seconds of stillness the projector wanders, so the opening
     line is never left unreadable and the room never looks switched off. */
  const idle = now - idleSince > 2000;
  pointer.idle = idle ? 1 : 0;

  if (idle) {
    const t = now / 1000;
    tx = window.innerWidth * (0.5 + Math.sin(t * 0.11) * 0.26 + Math.sin(t * 0.043) * 0.08);
    ty = window.innerHeight * (0.44 + Math.cos(t * 0.083) * 0.16);
  }

  /* Weight. The light has mass; it doesn't snap. */
  const ease = idle ? 0.02 : 0.14;
  const dx = (tx - pointer.x) * ease;
  const dy = (ty - pointer.y) * ease;
  pointer.x += dx;
  pointer.y += dy;
  pointer.speed += (Math.min(1, Math.hypot(dx, dy) / 26) - pointer.speed) * 0.16;
  pointer.nx = pointer.x / Math.max(1, window.innerWidth);
  pointer.ny = pointer.y / Math.max(1, window.innerHeight);

  emit();
};

const start = () => {
  if (raf || still || document.hidden) return;
  raf = requestAnimationFrame(frame);
};

const stop = () => {
  cancelAnimationFrame(raf);
  raf = 0;
};

const onVisibility = () => (document.hidden ? stop() : start());

const bind = () => {
  if (bound) return;
  bound = true;
  still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  idleSince = performance.now();
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
};

const unbind = () => {
  if (!bound) return;
  bound = false;
  stop();
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerdown", onMove);
  document.removeEventListener("pointerleave", onLeave);
  document.removeEventListener("visibilitychange", onVisibility);
};

/**
 * Listen to the light. Returns an unsubscribe.
 * The loop is reference-counted: no listeners, no loop, no cost.
 */
export function subscribePointer(fn: Listener) {
  listeners.add(fn);
  bind();
  start();
  fn(pointer);
  return () => {
    listeners.delete(fn);
    if (!listeners.size) unbind();
  };
}

/** 0..1 falloff of the light at a point, over `radius` px. Smoothstepped. */
export function lightAt(x: number, y: number, radius: number) {
  const d = Math.hypot(pointer.x - x, pointer.y - y);
  if (d >= radius) return 0;
  const n = clamp01(1 - d / radius);
  return n * n * (3 - 2 * n);
}
