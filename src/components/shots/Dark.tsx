"use client";

import { useEffect, useRef, useState } from "react";
import { Kinetic } from "@/components/ui/Kinetic";
import { useExperience } from "@/lib/experience";
import { STUDIO } from "@/content/studio";
import styles from "./Dark.module.css";

/* =========================================================================
   SHOT 01 — THE DARK
   The premise of the whole site, stated by making the visitor do it: the
   room is unlit, and the pointer is the only light in it. The headline is
   legible where the light falls and half-buried where it doesn't. Nobody
   has to be told what the studio believes; they find out by moving.

   Legibility is never sacrificed: when nothing has moved for two seconds
   the light drifts on its own, and the fallback line under the headline is
   always at full contrast.
   ========================================================================= */

export function Dark() {
  const { isTouch, reducedMotion, booted } = useExperience();
  const [engaged, setEngaged] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* Retire the "move the light" cue once they've moved it. */
  useEffect(() => {
    if (isTouch || reducedMotion) return;
    const onMove = () => setEngaged(true);
    window.addEventListener("pointermove", onMove, { once: true, passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isTouch, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="dark"
      data-shot="dark"
      className={`shot ${styles.dark}`}
      aria-labelledby="dark-title"
      data-booted={booted}
    >
      {/* A ring around the light — the aperture the visitor is looking
          through, and the thing the gate takes over from when they leave.
          The outer span carries the scroll-driven handoff, the inner one the
          slow fade for the pointer arriving; they must not share a
          transition or the handoff would lag half a second behind the
          scroll. */}
      <span className={styles.aperture} aria-hidden="true">
        <span className={styles.apertureRing} />
      </span>

      <div className={styles.head}>
        <span className="mono">Shot 01 — The Dark</span>
        <span className={`mono ${styles.cue}`} data-engaged={engaged}>
          {isTouch ? "Drag to move the light" : "Move the light"}
        </span>
      </div>

      <h1 id="dark-title" className={styles.title}>
        <Kinetic
          text="NOBODY REMEMBERS"
          mode="focus"
          className={styles.l1}
          delay={140}
          stagger={22}
        />
        <Kinetic text="A WEBSITE." mode="focus" className={styles.l2} delay={420} stagger={22} />
        <Kinetic
          text="THEY REMEMBER A ROOM."
          mode="wipe"
          className={styles.l3}
          delay={900}
          stagger={17}
          emphasis="ROOM"
        />
      </h1>

      <div className={styles.foot}>
        <p className={styles.thesis}>
          {STUDIO.thesis} So we stopped building documents.
          <br />
          <span className={styles.thesisDim}>
            {STUDIO.placeholder} builds places — websites, film and search presence for
            businesses that would rather be remembered than found in a folder of tabs.
          </span>
        </p>

        <a href="#template" className={styles.next} data-cursor="lock" data-cursor-label="Shot 02">
          <span className="mono">Keep going</span>
          <span className={styles.nextRule} aria-hidden="true" />
          <span className={styles.nextArrow} aria-hidden="true">
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
