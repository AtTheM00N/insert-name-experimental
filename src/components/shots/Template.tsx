"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plate } from "@/components/ui/Plate";
import { PALETTE } from "@/lib/plate";
import { useExperience } from "@/lib/experience";
import styles from "./Template.module.css";

/* =========================================================================
   SHOT 02 — THE COMPARISON
   The argument, made physical. One frame, one seam, and the visitor holds
   the seam. Left of it: the site everybody already has — a wireframe drawn
   in code, hero and three cards and a carousel, rendered accurately enough
   to be uncomfortable. Right of it: a place.

   Drag, arrow keys, or the slider under it. The seam is a real
   <input type="range"> so the interaction is keyboard-native and announced
   properly, with the visual layer painted on top.
   ========================================================================= */

const COPY = {
  left: {
    tag: "WHAT THE SAME BUDGET USUALLY BUYS",
    head: "A brochure with a scroll bar",
    bullets: [
      "Template with the colours swapped",
      "Hero image bought from a library",
      "Three cards nobody reads",
      "A carousel nobody clicks",
      "Loads in six seconds on a phone",
    ],
  },
  right: {
    tag: "WHAT WE MAKE INSTEAD",
    head: "A room with a door in it",
    bullets: [
      "Built from an empty file",
      "Every frame drawn in code",
      "Motion that means something",
      "Legible at 320px and at 4K",
      "Loads before you finish blinking",
    ],
  },
};

export function Template() {
  const { reducedMotion, isTouch } = useExperience();
  const [seam, setSeam] = useState(38);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const rafRef = useRef(0);
  const pending = useRef(38);

  /* Pointer drag anywhere on the frame — throttled to one write per frame. */
  const applyFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const r = frame.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    pending.current = Math.max(6, Math.min(94, pct));
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setSeam(pending.current);
    });
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      applyFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.removeProperty("user-select");
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [applyFromClientX]);

  const startDrag = (e: React.PointerEvent) => {
    // Let the range input own its own gesture.
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    dragging.current = true;
    document.body.style.setProperty("user-select", "none");
    applyFromClientX(e.clientX);
  };

  return (
    <section
      id="template"
      data-shot="template"
      className={`shot ${styles.wrap}`}
      aria-labelledby="template-title"
    >
      <header className={styles.head}>
        <span className="mono">Shot 02 — The Comparison</span>
        <h2 id="template-title" className={styles.title} data-rack="">
          Two websites.
          <br />
          <span className={styles.titleDim}>The same budget.</span>
        </h2>
        <p className="lede" data-rack="" style={{ "--rack-delay": "120ms" } as React.CSSProperties}>
          Take the seam and pull it. One of these is a document that happens to be online.
          The other is somewhere you have been.
        </p>
      </header>

      <div
        ref={frameRef}
        className={styles.frame}
        style={{ "--seam": `${seam}%` } as React.CSSProperties}
        onPointerDown={startDrag}
        data-rack=""
        data-cursor="drag"
        data-cursor-label="Drag"
      >
        {/* ---------- LEFT: the template internet ---------- */}
        <div className={styles.side} data-side="left">
          <div className={styles.sideInner}>
            <Wireframe />
            <div className={styles.overlay} data-side="left">
              <span className={styles.tag} data-side="left">
                {COPY.left.tag}
              </span>
              <h3 className={styles.sideHead}>{COPY.left.head}</h3>
              <ul className={styles.list}>
                {COPY.left.bullets.map((b) => (
                  <li key={b}>
                    <span className={styles.strike}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: a place ---------- */}
        <div className={styles.side} data-side="right">
          <div className={styles.sideInner}>
            <Plate
              kind="flow"
              seed="comparison-room"
              hi={PALETTE.bone}
              lo={PALETTE.dim}
              chunk={8}
              live={!reducedMotion}
              className={styles.plate}
            />
            <div className={styles.overlay} data-side="right">
              <span className={styles.tag} data-side="right">
                {COPY.right.tag}
              </span>
              <h3 className={styles.sideHead}>{COPY.right.head}</h3>
              <ul className={styles.list}>
                {COPY.right.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- the seam ---------- */}
        <div className={styles.seam} aria-hidden="true">
          <span className={styles.seamLine} />
          <span className={styles.seamGrip}>
            <span className={styles.seamArrow}>◄</span>
            <span className={styles.seamArrow}>►</span>
          </span>
        </div>

        <label className={styles.control}>
          <span className="sr-only">
            Comparison position — template on the left, {"INSERT_NAME"} on the right
          </span>
          <input
            type="range"
            min={6}
            max={94}
            step={1}
            value={Math.round(seam)}
            onChange={(e) => setSeam(Number(e.target.value))}
            className={styles.range}
            aria-valuetext={`${Math.round(seam)} percent template`}
          />
        </label>
      </div>

      <p className={styles.aside} data-rack="">
        {isTouch ? "Drag the seam." : "Drag anywhere. Or use the arrow keys."}{" "}
        <span className={styles.asideDim}>
          Both sides of that frame are drawn by the same few kilobytes of code. No images were
          harmed, or purchased.
        </span>
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------
   The template internet, drawn honestly. Static SVG, no images, no cost.
   It's a caricature — but only just.
   ------------------------------------------------------------------------- */
function Wireframe() {
  return (
    <svg
      className={styles.wire}
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* nav */}
      <rect x="0" y="0" width="640" height="34" className={styles.wireFill} />
      <rect x="28" y="13" width="58" height="9" className={styles.wireInk} />
      {[380, 432, 484, 536].map((x) => (
        <rect key={x} x={x} y="15" width="34" height="5" className={styles.wireInk} />
      ))}
      {/* hero */}
      <rect x="28" y="66" width="300" height="17" className={styles.wireInk} />
      <rect x="28" y="92" width="240" height="17" className={styles.wireInk} />
      <rect x="28" y="128" width="104" height="26" className={styles.wireBtn} />
      <rect x="360" y="60" width="252" height="150" className={styles.wireBox} />
      <path d="M360 210 L438 130 L494 186 L540 148 L612 210 Z" className={styles.wireImg} />
      <circle cx="574" cy="94" r="17" className={styles.wireImg} />
      {/* three cards */}
      {[28, 234, 440].map((x) => (
        <g key={x}>
          <rect x={x} y="248" width="172" height="112" className={styles.wireBox} />
          <rect x={x + 16} y="266" width="52" height="8" className={styles.wireInk} />
          <rect x={x + 16} y="286" width="132" height="5" className={styles.wireInk} />
          <rect x={x + 16} y="298" width="118" height="5" className={styles.wireInk} />
          <rect x={x + 16} y="310" width="126" height="5" className={styles.wireInk} />
          <rect x={x + 16} y="332" width="44" height="5" className={styles.wireBtn} />
        </g>
      ))}
      {/* the carousel dots nobody clicks */}
      {[296, 312, 328, 344].map((x, i) => (
        <circle key={x} cx={x} cy="382" r="3" className={i === 0 ? styles.wireBtn : styles.wireInk} />
      ))}
    </svg>
  );
}
