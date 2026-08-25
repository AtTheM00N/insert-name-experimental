"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/lib/experience";
import { useShots } from "@/lib/shots";
import styles from "./Rail.module.css";

/* =========================================================================
   RAIL — the navigation.
   No navbar. The film has a strip down its right edge with one tick per
   shot, the way a reel has frames. It reports where you are, fills as you
   travel, and only names the shots when you go looking. Every tick is a
   real anchor link, so it works with a keyboard, a screen reader, and with
   JavaScript switched off.
   ========================================================================= */

export function Rail() {
  const { shots, activeId } = useShots();
  const { mounted } = useExperience();
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  /* Fill the strip as the film runs. Written straight to CSS, no re-render. */
  useEffect(() => {
    if (!mounted) return;
    const nav = navRef.current;
    if (!nav) return;

    let raf = 0;
    let last = -1;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      const rounded = Math.round(p * 500) / 500;
      if (rounded === last) return;
      last = rounded;
      nav.style.setProperty("--run", String(rounded));
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  return (
    <nav
      ref={navRef}
      className={styles.rail}
      aria-label="Shots"
      data-open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <span className={styles.strip} aria-hidden="true">
        <span className={styles.run} />
      </span>

      <ol className={styles.list}>
        {shots.map((shot) => {
          const current = shot.id === activeId;
          return (
            <li key={shot.id} className={styles.item}>
              <a
                href={`#${shot.id}`}
                className={styles.link}
                data-current={current}
                data-cursor="lock"
                aria-current={current ? "true" : undefined}
              >
                <span className={styles.tick} aria-hidden="true" />
                <span className={styles.meta}>
                  <span className={styles.no}>{shot.no}</span>
                  <span className={styles.label}>{shot.label}</span>
                  <span className={styles.mark}>{shot.mark}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
