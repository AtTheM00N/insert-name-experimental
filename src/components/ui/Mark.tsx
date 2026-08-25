"use client";

import { useExperience } from "@/lib/experience";
import { STUDIO } from "@/content/studio";
import styles from "./Mark.module.css";

/* =========================================================================
   MARK
   The studio's wordmark, and the one interactive character on the site that
   isn't announced: the underscore. It breathes very slightly, and pressing
   it opens the blank. Labelled properly, so a screen reader gets told what
   it does rather than being left with a lone underscore.
   ========================================================================= */

export function Mark({ compact = false }: { compact?: boolean }) {
  const { studioName, isNamed } = useExperience();

  const open = () => window.dispatchEvent(new CustomEvent("insert-name:blank"));

  /* Once named, the mark simply is the name — no split, no blank. */
  if (isNamed) {
    return (
      <span className={styles.mark} data-compact={compact || undefined}>
        <span className={styles.bracket}>[</span>
        <button
          type="button"
          className={styles.named}
          onClick={open}
          data-cursor="lock"
          data-cursor-label="Rename"
          title="Rename the studio"
        >
          {studioName}
        </button>
        <span className={styles.bracket}>]</span>
      </span>
    );
  }

  return (
    <span className={styles.mark} data-compact={compact || undefined}>
      <span className={styles.bracket}>[</span>
      <span className={styles.word}>{STUDIO.mark.insert}</span>
      <button
        type="button"
        className={styles.blank}
        onClick={open}
        data-cursor="lock"
        data-cursor-label="Fill it in"
      >
        <span aria-hidden="true">{STUDIO.mark.blank}</span>
        <span className="sr-only">Fill in the studio&apos;s name</span>
      </button>
      <span className={styles.word}>{STUDIO.mark.name}</span>
      <span className={styles.bracket}>]</span>
    </span>
  );
}
