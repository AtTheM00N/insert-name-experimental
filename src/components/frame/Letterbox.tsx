"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";
import { useShots } from "@/lib/shots";
import { STUDIO } from "@/content/studio";
import styles from "./Letterbox.module.css";

/* =========================================================================
   LETTERBOX
   The film never stops being a film. Two bars — top and bottom — carry the
   running metadata of the reel: what we're watching now, how far in we are,
   what the studio is called this session, and the timecode. They are the
   steadfast part of the site: everything else moves around them.
   ========================================================================= */

export function Letterbox() {
  const { studioName, isNamed, reducedMotion } = useExperience();
  const { activeShot, index } = useActiveShot();
  const clock = useRef<HTMLSpanElement>(null);
  const globalName = isNamed ? studioName : STUDIO.placeholder;

  /* The reel clock — a running timecode, written straight to the node so a
     ticking counter never costs a React render. Capped at the 24fps it
     actually displays, parked while the tab is hidden, and left frozen for
     anyone who asked for stillness: a flickering frame count is exactly the
     kind of perpetual motion that request is about. */
  useEffect(() => {
    const el = clock.current;
    if (!el || reducedMotion) return;

    const FRAME_MS = 1000 / 24;
    let raf = 0;
    let last = 0;
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      el.textContent = timecode((now - start) / 1000);
    };

    const play = () => {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => (document.hidden ? pause() : play());

    play();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return (
    <>
      <div className={styles.bar} data-side="top" aria-hidden="false">
        <span className={styles.barItem} data-kind="mark">
          <span className={styles.bracket}>[</span>
          {globalName}
          <span className={styles.bracket}>]</span>
        </span>

        <span className={styles.barItem} data-kind="slate">
          {activeShot ? activeShot.slate : STUDIO.role.toUpperCase()}
        </span>

        <span className={`${styles.barItem} ${styles.onlyWide}`} data-kind="meta">
          <span className={styles.signal} /> PRODUCTION · REEL 01
        </span>

        <span className={`${styles.barItem} ${styles.onlyWide}`} data-kind="reel">
          {activeShot ? activeShot.mark : "00:00"}
        </span>
      </div>

      <div className={styles.bar} data-side="bottom" aria-hidden="false">
        <span className={styles.barItem} data-kind="frame">
          {activeShot ? `${activeShot.no} / ${String(index + 1).padStart(2, "0")}` : "01 / 01"}
        </span>

        <span className={styles.barItem} data-kind="brand">
          {globalName}
        </span>

        <span className={`${styles.barItem} ${styles.onlyWide}`} data-kind="clock">
          <span className={styles.signal} data-rec /> TIME&nbsp;
          <span ref={clock} aria-hidden="true">00:00:00:00</span>
          <span className="sr-only">reel timecode</span>
        </span>

        <span className={`${styles.barItem} ${styles.onlyWide}`} data-kind="disciplines">
          {STUDIO.disciplines.join(" · ")}
        </span>
      </div>
    </>
  );
}

function timecode(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 24);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
}

/** The shot currently centred in the viewport, plus its index on the reel. */
function useActiveShot() {
  const { shots, activeId } = useShots();
  const index = Math.max(
    0,
    shots.findIndex((s) => s.id === activeId),
  );
  return { activeShot: shots[Math.min(index, shots.length - 1)], index };
}
