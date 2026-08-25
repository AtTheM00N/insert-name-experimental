"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "@/lib/experience";
import { useLockBody } from "@/lib/hooks";
import { STUDIO } from "@/content/studio";
import styles from "./Boot.module.css";

/* =========================================================================
   BOOT — the academy leader.
   Not a fake progress bar. It counts down while the fonts actually load,
   holds for one beat, then opens like a shutter into the first shot.
   Any key, click, scroll or tap cuts straight to the film. Shown once per
   session. Skipped entirely for visitors who asked for reduced motion, and
   never rendered at all without JavaScript — the site underneath is whole.
   ========================================================================= */

const STEPS = [
  { n: "5", cue: "Threading reel" },
  { n: "4", cue: "Checking the gate" },
  { n: "3", cue: "Exposing plate" },
  { n: "2", cue: "Pulling focus" },
  { n: "1", cue: "Sound — off by design" },
];

const STEP_MS = 260;

export function Boot() {
  const { setBooted, markLeaderDone, leaderSeen, mounted, studioName, isNamed } = useExperience();
  const [phase, setPhase] = useState<"count" | "hold" | "open" | "gone">("count");
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);

  /* The store already knows whether the leader has run this session, and
     whether it was ever wanted — so there is nothing to decide in an effect. */
  const run = mounted && !leaderSeen;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    markLeaderDone();
    setBooted(true);
    setPhase("open");
    timers.current.push(window.setTimeout(() => setPhase("gone"), 900));
  }, [markLeaderDone, setBooted]);

  /* ---- run the leader ---- */
  useEffect(() => {
    if (!run) return;

    let cancelled = false;
    const startedAt = performance.now();

    STEPS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          if (!cancelled) setStep(i);
        }, i * STEP_MS),
      );
    });

    const countDone = STEPS.length * STEP_MS;

    // Real gate: the leader does not end before the type is ready to be read.
    const fonts =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready
        : Promise.resolve();

    Promise.race([fonts, new Promise((r) => window.setTimeout(r, 2600))]).then(() => {
      if (cancelled) return;
      const waited = performance.now() - startedAt;
      const remaining = Math.max(0, countDone - waited);
      timers.current.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setPhase("hold");
          timers.current.push(window.setTimeout(() => finish(), 420));
        }, remaining),
      );
    });

    return () => {
      cancelled = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  /* ---- any input cuts to the film ---- */
  useEffect(() => {
    if (!run || phase === "gone" || phase === "open") return;
    const cut = () => finish();
    window.addEventListener("keydown", cut);
    window.addEventListener("pointerdown", cut);
    window.addEventListener("wheel", cut, { passive: true });
    window.addEventListener("touchstart", cut, { passive: true });
    return () => {
      window.removeEventListener("keydown", cut);
      window.removeEventListener("pointerdown", cut);
      window.removeEventListener("wheel", cut);
      window.removeEventListener("touchstart", cut);
    };
  }, [run, phase, finish]);

  useLockBody(run && (phase === "count" || phase === "hold"));

  if (!run || phase === "gone") return null;

  const current = STEPS[Math.min(step, STEPS.length - 1)]!;
  const name = isNamed ? studioName : STUDIO.placeholder;

  return (
    <div className={styles.boot} data-phase={phase} role="presentation">
      {/* Two shutter halves. They hold the leader, then open on the film. */}
      <div className={styles.half} data-half="top">
        <div className={styles.inner}>
          <div className={styles.leader}>
            <svg className={styles.crosshair} viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="88" />
              <circle cx="100" cy="100" r="62" />
              <line x1="100" y1="0" x2="100" y2="200" />
              <line x1="0" y1="100" x2="200" y2="100" />
              <line className={styles.sweep} x1="100" y1="100" x2="100" y2="12" />
            </svg>
            <span className={styles.count} key={step} data-step={step}>
              {phase === "hold" ? "" : current.n}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.half} data-half="bottom">
        <div className={styles.inner}>
          <div className={styles.status}>
            <span className={styles.mark}>
              <span className={styles.bracket}>[</span>
              {name}
              <span className={styles.bracket}>]</span>
            </span>
            <span className={styles.cue} aria-live="polite">
              {phase === "hold" ? "Ready" : current.cue}
            </span>
            <span className={styles.skip}>Press anything to cut</span>
          </div>
        </div>
      </div>
    </div>
  );
}
