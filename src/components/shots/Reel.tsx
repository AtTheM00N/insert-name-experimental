"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plate } from "@/components/ui/Plate";
import { PALETTE } from "@/lib/plate";
import { useExperience } from "@/lib/experience";
import { FRAMES, PROOF, REEL_NOTE, type Frame } from "@/content/reel";
import styles from "./Reel.module.css";

/* =========================================================================
   SHOT 03 — THE REEL
   The gallery is a filmstrip, run sideways. Native horizontal scroll — so
   trackpads, touch, shift-wheel, tab and arrow keys all work without us
   reimplementing scrolling — with snap points on each frame and a sprocket
   strip above that reads as a position indicator.

   Every plate is generated. There are no client photographs, because there
   are no clients yet, and inventing them would be the one unforgivable
   thing on a site whose whole argument is honesty about craft.
   ========================================================================= */

export function Reel() {
  const { isTouch } = useExperience();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState<Frame | null>(null);

  /* Track which frame owns the strip, and how far along we are. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = track.scrollWidth - track.clientWidth;
        const p = max > 0 ? track.scrollLeft / max : 0;
        setProgress(p);
        const cells = Array.from(track.querySelectorAll<HTMLElement>("[data-cell]"));
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestD = Infinity;
        cells.forEach((cell, i) => {
          const c = cell.offsetLeft + cell.offsetWidth / 2;
          const d = Math.abs(c - mid);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        setActive(best);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Vertical wheel over the strip drives it sideways — but only while the
     strip still has somewhere to go, so the page never feels trapped. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || isTouch) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      const next = track.scrollLeft + e.deltaY;
      const atStart = track.scrollLeft <= 0.5 && e.deltaY < 0;
      const atEnd = track.scrollLeft >= max - 0.5 && e.deltaY > 0;
      if (atStart || atEnd) return; // hand the page back its scroll
      e.preventDefault();
      track.scrollLeft = Math.max(0, Math.min(max, next));
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [isTouch]);

  const nudge = useCallback((dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const cell = track.querySelector<HTMLElement>("[data-cell]");
    const step = cell ? cell.offsetWidth + 18 : track.clientWidth * 0.6;
    track.scrollBy({ left: step * dir, behavior: "smooth" });
  }, []);

  /* Escape closes the open case study. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="reel" data-shot="reel" className={`shot ${styles.wrap}`} aria-labelledby="reel-title">
      <header className={styles.head}>
        <div>
          <span className="mono">Shot 03 — The Reel</span>
          <h2 id="reel-title" className={styles.title} data-rack="">
            Six frames.
            <br />
            <span className={styles.titleDim}>Mostly unexposed.</span>
          </h2>
        </div>

        <div className={styles.headSide}>
          <p className={styles.note} data-rack="">
            {REEL_NOTE}
          </p>
          <dl className={styles.proof} data-rack="">
            {PROOF.map((p) => (
              <div key={p.k} className={styles.proofRow}>
                <dt>{p.k}</dt>
                <dd>{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ---- sprocket strip: position, drawn as perforations ---- */}
      <div className={styles.sprocket} aria-hidden="true">
        <span
          className={styles.sprocketRun}
          style={{ transform: `scaleX(${progress || 0.001})` }}
        />
        {FRAMES.map((f, i) => (
          <span key={f.id} className={styles.hole} data-on={i === active} />
        ))}
      </div>

      {/* ---- the strip ---- */}
      <div
        ref={trackRef}
        className={styles.track}
        role="region"
        aria-label="Reel — scroll sideways through six frames"
        tabIndex={0}
      >
        {FRAMES.map((frame, i) => (
          <Cell
            key={frame.id}
            frame={frame}
            index={i}
            active={i === active}
            onOpen={() => setOpen(frame)}
          />
        ))}

        <div className={styles.tail} data-cell>
          <div className={styles.tailInner}>
            <span className="mono">End of exposed stock</span>
            <p className={styles.tailCopy}>
              Frame 07 is unassigned. It could be yours, and it would be the one everybody
              points at first.
            </p>
            <a href="#invitation" className={styles.tailLink} data-cursor="lock">
              Take frame 07 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <span className={`mono ${styles.counter}`}>
          {String(active + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
        </span>
        <span className={styles.hint}>
          {isTouch ? "Swipe the strip" : "Scroll, drag, or use ← →"}
        </span>
        <div className={styles.arrows}>
          <button type="button" onClick={() => nudge(-1)} className={styles.arrow} data-cursor="lock">
            <span className="sr-only">Previous frame</span>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={() => nudge(1)} className={styles.arrow} data-cursor="lock">
            <span className="sr-only">Next frame</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {open ? <CaseSheet frame={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

/* ------------------------------------------------------------------------- */

function Cell({
  frame,
  index,
  active,
  onOpen,
}: {
  frame: Frame;
  index: number;
  active: boolean;
  onOpen: () => void;
}) {
  const hoverRef = useRef(0);
  const { reducedMotion } = useExperience();

  return (
    <article
      className={styles.cell}
      data-cell
      data-ratio={frame.ratio}
      data-active={active}
      data-status={frame.status}
      onPointerEnter={() => {
        hoverRef.current = 1;
      }}
      onPointerLeave={() => {
        hoverRef.current = 0;
      }}
    >
      <div className={styles.cellTop}>
        <span className={styles.cellNo}>{frame.no}</span>
        <span className={styles.cellCat}>{frame.category}</span>
        <span className={styles.cellStatus} data-status={frame.status}>
          {frame.status === "developing" ? "DEVELOPING" : "UNEXPOSED"}
        </span>
      </div>

      <button
        type="button"
        className={styles.cellPlate}
        onClick={onOpen}
        data-cursor="lock"
        data-cursor-label="Open"
        aria-label={`Open frame ${frame.no} — ${frame.title}`}
      >
        <Plate
          kind={frame.texture === "type" ? "iris" : (frame.texture as "grid" | "scan" | "flow" | "grain")}
          seed={frame.seed}
          hi={index % 3 === 1 ? PALETTE.signal : PALETTE.bone}
          lo={PALETTE.dim}
          chunk={frame.ratio === "21:9" ? 8 : 7}
          live={!reducedMotion}
          intensityRef={hoverRef}
          className={styles.plate}
        />

        {/* Sprocket holes down both edges — this is a frame on a strip. */}
        <span className={styles.perfs} data-edge="top" aria-hidden="true" />
        <span className={styles.perfs} data-edge="bottom" aria-hidden="true" />

        <span className={styles.cellReveal}>
          <span className={styles.cellRevealInner}>
            Open frame <span aria-hidden="true">↗</span>
          </span>
        </span>
      </button>

      <div className={styles.cellFoot}>
        <h3 className={styles.cellTitle}>{frame.title}</h3>
        <p className={styles.cellBrief}>{frame.brief}</p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------
   The case-study entry point. Honest by construction: it shows the process
   we'd run, not results we haven't produced.
   ------------------------------------------------------------------------- */

const PROCESS = [
  { n: "01", k: "Read the room", v: "What the business actually is, in its own words." },
  { n: "02", k: "Find the frame", v: "One idea the whole thing can hang from." },
  { n: "03", k: "Direct it", v: "Type, light, motion and pace decided together." },
  { n: "04", k: "Build it", v: "From an empty file, to a performance budget." },
  { n: "05", k: "Ship and watch", v: "Measured, then adjusted. Numbers shown in full." },
];

function CaseSheet({ frame, onClose }: { frame: Frame; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  /* Focus the sheet on open so keyboard users land inside it. */
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={frame.title}>
      <button
        type="button"
        className={styles.sheetScrim}
        onClick={onClose}
        aria-label="Close frame"
        data-cursor="lock"
        data-cursor-label="Close"
      />
      <div className={styles.sheetBody} ref={ref} tabIndex={-1}>
        <div className={styles.sheetHead}>
          <span className="mono">
            Frame {frame.no} — {frame.category}
          </span>
          <button type="button" onClick={onClose} className={styles.sheetClose} data-cursor="lock">
            Close <span aria-hidden="true">×</span>
          </button>
        </div>

        <h3 className={styles.sheetTitle}>{frame.title}</h3>
        <p className={styles.sheetBrief}>{frame.brief}</p>

        <p className={styles.sheetHonest}>
          This frame has no case study yet, and we will not invent one. What follows is the
          process it would be exposed with — the same one that produced the site you are
          standing in.
        </p>

        <ol className={styles.process}>
          {PROCESS.map((p) => (
            <li key={p.n} className={styles.processRow}>
              <span className={styles.processNo}>{p.n}</span>
              <span className={styles.processKey}>{p.k}</span>
              <span className={styles.processVal}>{p.v}</span>
            </li>
          ))}
        </ol>

        <a href="#invitation" className={styles.sheetCta} onClick={onClose} data-cursor="lock">
          Expose this frame <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
