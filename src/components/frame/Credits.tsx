"use client";

import { Mark } from "@/components/ui/Mark";
import { useExperience } from "@/lib/experience";
import { MANIFESTO, STUDIO } from "@/content/studio";
import { SHOTS } from "@/content/shots";
import styles from "./Credits.module.css";

/* =========================================================================
   CREDITS
   The end of a film has credits, so this one does too. It carries the
   footer's real work — the mark, the shot list as a plain link list, the
   contact address — plus a marquee of everything the studio refuses to do.
   The marquee is duplicated in the DOM and translated by 50%, which is the
   only way to loop one without a single line of JavaScript.
   ========================================================================= */

export function Credits() {
  const { studioName, isNamed, reducedMotion } = useExperience();
  const name = isNamed ? studioName : STUDIO.placeholder;

  return (
    <footer className={styles.credits}>
      {/* ---- the refusals ---- */}
      <div className={styles.marquee} data-still={reducedMotion} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[0, 1].map((copy) => (
            <span key={copy} className={styles.marqueeRun}>
              {MANIFESTO.map((line) => (
                <span key={line} className={styles.marqueeItem}>
                  {line}
                  <span className={styles.marqueeSep}>◦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">
        What we don&apos;t do: {MANIFESTO.join(", ")}.
      </p>

      <div className={styles.body}>
        <div className={styles.block}>
          <Mark />
          <p className={styles.role}>{STUDIO.role}</p>
          <p className={styles.long}>{STUDIO.long}</p>
        </div>

        <nav className={styles.block} aria-label="The film">
          <span className={styles.blockLabel}>The film</span>
          <ol className={styles.list}>
            {SHOTS.map((shot) => (
              <li key={shot.id}>
                <a href={`#${shot.id}`} className={styles.link} data-cursor="lock">
                  <span className={styles.linkNo}>{shot.no}</span>
                  {shot.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.block}>
          <span className={styles.blockLabel}>Say something</span>
          <a href={`mailto:${STUDIO.email}`} className={styles.email} data-cursor="lock">
            {STUDIO.email}
          </a>
          <p className={styles.small}>
            Answered by a person, usually the one who&apos;d do the work.
          </p>

          <span className={styles.blockLabel} style={{ marginTop: "auto" }}>
            Built with
          </span>
          <p className={styles.small}>
            Next.js, TypeScript and about 4kb of shader. Every image on this site is generated in
            the browser — no photographs were bought, and none were needed.
          </p>
        </div>
      </div>

      <div className={styles.base}>
        <span className={styles.baseItem}>
          © {STUDIO.year} {name}
        </span>
        <span className={styles.baseItem} data-dim>
          End of reel
        </span>
        <a href="#dark" className={styles.baseLink} data-cursor="lock">
          Run it again <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
