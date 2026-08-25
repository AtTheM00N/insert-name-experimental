/* =========================================================================
   THE CAMERA — one scroll reader for the whole film.

   The film used to have four separate scroll listeners, each doing its own
   layout reads. This is one, rAF-coalesced, and it only measures the two or
   three sections that are actually on screen. It publishes numbers as CSS
   variables so the depth itself is declared in stylesheets and animated by
   the compositor — no JS touches a transform.

     :root --film    0..1   how far through the film we are
     :root --gate    0..1   the Dark → Template handoff (see <Gate/>)
     :root --gate-w  px     the exact box the gate hands over to
     :root --gate-h  px
     [data-shot] --t -1..1  signed distance of this shot from the lens
     [data-shot] --in 0..1  how far this shot has entered

   `--t` is the whole depth vocabulary. A shot below the lens has +1, one
   above has -1, and the one you are looking at has 0. Anything inside a
   shot can lean on that to sit at its own distance from the camera.
   ========================================================================= */

type Tracked = { el: HTMLElement; t: number; enter: number };

let raf = 0;
let queued = false;
let bound = false;
let film = -1;
let gate = -1;
let gateLive = false;

const tracked = new Map<HTMLElement, Tracked>();
let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let gateEl: HTMLElement | null = null;

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/* Two decimal places is finer than a compositor can show and coarse enough
   that small scroll jitter doesn't dirty style for nothing. */
const q = (n: number) => Math.round(n * 100) / 100;

const measure = () => {
  queued = false;
  const vh = window.innerHeight || 1;
  const doc = document.documentElement;

  /* ---- global progress ---- */
  const max = doc.scrollHeight - vh;
  const next = q(max > 0 ? clamp(doc.scrollTop / max, 0, 1) : 0);
  if (next !== film) {
    film = next;
    doc.style.setProperty("--film", String(film));
  }

  /* ---- per-shot depth ---- */
  const mid = vh / 2;
  for (const entry of tracked.values()) {
    const r = entry.el.getBoundingClientRect();
    /* Signed, in viewport-heights, of this shot's centre against the lens. */
    const t = q(clamp((r.top + r.height / 2 - mid) / vh, -1.5, 1.5));
    /* How far the shot has entered: 0 as its top touches the bottom edge. */
    const enter = q(clamp(1 - (r.top - vh * 0.1) / (vh * 0.75), 0, 1));
    if (t !== entry.t) {
      entry.t = t;
      entry.el.style.setProperty("--t", String(t));
    }
    if (enter !== entry.enter) {
      entry.enter = enter;
      entry.el.style.setProperty("--in", String(enter));
    }
  }

  /* ---- the gate ----
     One window, defined by a sentinel sitting on the splice between the
     first two shots. It opens while the sentinel is still below the fold,
     so the hero starts pulling away the moment the visitor leaves it, and
     closes once the sentinel is near the top of the frame. */
  if (gateEl) {
    const top = gateEl.getBoundingClientRect().top;
    const from = vh * 1.15;
    const to = vh * 0.12;
    const g = q(clamp((from - top) / (from - to), 0, 1));
    const live = g > 0.001 && g < 0.999;
    if (g !== gate) {
      gate = g;
      doc.style.setProperty("--gate", String(g));
    }
    if (live !== gateLive) {
      gateLive = live;
      if (live) doc.setAttribute("data-gate", "live");
      else doc.removeAttribute("data-gate");
    }
  }
};

const request = () => {
  if (queued || document.hidden) return;
  queued = true;
  raf = requestAnimationFrame(measure);
};

const onVisibility = () => {
  if (!document.hidden) request();
};

const bind = () => {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
};

/**
 * Starts the camera. Returns a teardown.
 * Only shots that intersect the viewport are measured, so the per-frame
 * cost is two or three getBoundingClientRect calls regardless of how long
 * the film gets.
 */
export function startCamera() {
  const shots = Array.from(document.querySelectorAll<HTMLElement>("[data-shot]"));
  gateEl = document.querySelector<HTMLElement>("[data-gate-sentinel]");

  /* The gate hands over to a real element, so it takes its dimensions from
     that element rather than trying to reproduce its box in CSS. Measured
     only when the box actually changes size — never per frame — which also
     means the two shapes cannot drift apart at any viewport, or when a
     scrollbar appears, or on the phone layout where the frame stands up. */
  const target = document.querySelector<HTMLElement>("[data-gate-target]");
  if (target) {
    const doc = document.documentElement;
    ro = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box || box.width < 2) return;
      doc.style.setProperty("--gate-w", `${Math.round(box.width)}px`);
      doc.style.setProperty("--gate-h", `${Math.round(box.height)}px`);
    });
    ro.observe(target);
  }

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          if (!tracked.has(el)) tracked.set(el, { el, t: NaN, enter: NaN });
        } else {
          tracked.delete(el);
          /* Park it at rest so nothing is left mid-transform off screen. */
          el.style.setProperty("--t", entry.boundingClientRect.top > 0 ? "1" : "-1");
          el.style.setProperty("--in", entry.boundingClientRect.top > 0 ? "0" : "1");
        }
      }
      request();
    },
    { rootMargin: "18% 0px 18% 0px" },
  );

  shots.forEach((el) => io?.observe(el));
  bind();
  measure();

  return () => {
    io?.disconnect();
    io = null;
    ro?.disconnect();
    ro = null;
    tracked.clear();
    gateEl = null;
    bound = false;
    cancelAnimationFrame(raf);
    queued = false;
    film = -1;
    gate = -1;
    window.removeEventListener("scroll", request);
    window.removeEventListener("resize", request);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
