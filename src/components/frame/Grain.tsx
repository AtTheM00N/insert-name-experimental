"use client";

import { useExperience } from "@/lib/experience";
import styles from "./Grain.module.css";

/**
 * Film stock. A tiled turbulence pattern nudged around on a stepped
 * animation — no canvas, no JavaScript per frame, no measurable cost. It sits
 * over everything, because grain belongs to the whole image and not to
 * individual elements.
 */
export function Grain() {
  const { reducedMotion, quality, mounted } = useExperience();
  if (!mounted || quality === "low") return null;
  return <div className={styles.grain} data-still={reducedMotion} aria-hidden="true" />;
}
