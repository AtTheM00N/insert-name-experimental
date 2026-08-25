"use client";

import styles from "./Gate.module.css";

/** The hairline between Shot 01 and Shot 02, and the thing the camera reads. */
export function GateSplice() {
  return (
    <span
      className={styles.sentinel}
      data-gate-sentinel
      aria-hidden="true"
    />
  );
}

/**
 * The visual gate is temporarily disabled.
 * GateSplice remains active so the camera/transition system
 * can still detect the Shot 01 → Shot 02 boundary.
 */
export function Gate() {
  return null;
}