"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";
import { cx } from "@/lib/utils";
import styles from "./Kinetic.module.css";

/* =========================================================================
   KINETIC TYPE
   Two behaviours, one primitive, used everywhere:

   Wipe   — letters arrive from the dark, stepped like frames on a strip.
            Pure CSS delay; no JS per frame.
   Focus  — the light finds letters near the pointer and pulls them into
            focus. One rAF loop for the whole line, and it writes CSS
            variables only when the pointer has actually moved.

   Both are one <span> per character with the whole word in an sr-only, so
   assistive tech reads the sentence, not the alphabet.
   ========================================================================= */

type Props = {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  /** "wipe" is safe everywhere. "focus" only runs on fine pointers. */
  mode?: "wipe" | "focus";
  className?: string;
  /** ms before the first character lands */
  delay?: number;
  /** ms between characters */
  stagger?: number;
  /** Adds the studio's own em-dash accent to a word — pass a substring. */
  emphasis?: string;
};

export function Kinetic({
  text,
  as: Tag = "span",
  mode = "wipe",
  className,
  delay = 0,
  stagger = 26,
  emphasis,
}: Props) {
  const { reducedMotion, isTouch, mounted } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const interactive = mode === "focus" && mounted && !reducedMotion && !isTouch;

  /* Pointer-reactive focus. Runs one loop for the whole line and bails
     immediately when the pointer hasn't moved. */
  useEffect(() => {
    if (!interactive) return;
    const host = ref.current;
    if (!host) return;

    const chars = Array.from(host.querySelectorAll<HTMLElement>("[data-ch]"));
    if (!chars.length) return;

    let raf = 0;
    let lastX = -1;
    let lastY = -1;
    let boxes: Array<{ el: HTMLElement; x: number; y: number }> = [];

    const measure = () => {
      boxes = chars.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    measure();

    const root = document.documentElement;

    const loop = () => {
      raf = requestAnimationFrame(loop);

      const px = parseFloat(getComputedStyle(root).getPropertyValue("--px"));
      const py = parseFloat(getComputedStyle(root).getPropertyValue("--py"));
      if (!Number.isFinite(px) || !Number.isFinite(py)) return;
      if (Math.abs(px - lastX) < 0.6 && Math.abs(py - lastY) < 0.6) return;
      lastX = px;
      lastY = py;

      const radius = 210;
      for (const b of boxes) {
        const d = Math.hypot(b.x - px, b.y - py);
        const near = d > radius ? 0 : 1 - d / radius;
        // Ease it so the falloff has a shoulder rather than a cone.
        const k = near * near * (3 - 2 * near);
        b.el.style.setProperty("--near", k.toFixed(3));
      }
    };

    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(measure);
    ro.observe(host);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      chars.forEach((el) => el.style.removeProperty("--near"));
    };
  }, [interactive, text]);

  const words = text.split(" ");
  let index = 0;

  return (
    <Tag
      ref={ref as never}
      className={cx(styles.kinetic, className)}
      data-mode={interactive ? "focus" : "wipe"}
      data-rack={mode === "wipe" ? "" : undefined}
      style={{ "--rack-delay": `${delay}ms` } as React.CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={styles.line}>
        {words.map((word, wi) => {
          const isEmphasis = emphasis ? word.replace(/[^\p{L}]/gu, "") === emphasis : false;
          return (
            <span
              key={`${word}-${wi}`}
              className={styles.word}
              data-emphasis={isEmphasis || undefined}
            >
              {Array.from(word).map((ch, ci) => {
                const i = index;
                index += 1;
                return (
                  <span
                    key={`${ch}-${ci}`}
                    data-ch=""
                    className={styles.ch}
                    style={
                      {
                        "--i": i,
                        "--ch-delay": `${delay + i * stagger}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
