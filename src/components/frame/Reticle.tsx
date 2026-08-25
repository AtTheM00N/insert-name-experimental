"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/lib/experience";
import styles from "./Reticle.module.css";

/* =========================================================================
   RETICLE
   Not a dot that follows the mouse — a camera focus box. It hunts for
   whatever is under the pointer, snaps onto it, and reports what pressing
   it will do. On touch devices and under reduced motion, the system cursor
   is left exactly where it belongs.
   ========================================================================= */

type Mode = "idle" | "lock" | "drag" | "text";

export function Reticle() {
  const { mounted, reducedMotion, isTouch } = useExperience();
  const enabled = mounted && !reducedMotion && !isTouch;

  const boxRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("cursor-hidden");

    const box = boxRef.current;
    if (!box) return;

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let raf = 0;

    // When locked onto a target, the reticle takes the target's box.
    let lock: { x: number; y: number; w: number; h: number } | null = null;
    const cur = { x: px, y: py, w: 18, h: 18 };

    const loop = () => {
      raf = requestAnimationFrame(loop);

      const targetX = lock ? lock.x : px;
      const targetY = lock ? lock.y : py;
      const targetW = lock ? lock.w : 18;
      const targetH = lock ? lock.h : 18;

      const ease = lock ? 0.22 : 0.3;
      cur.x += (targetX - cur.x) * ease;
      cur.y += (targetY - cur.y) * ease;
      cur.w += (targetW - cur.w) * 0.24;
      cur.h += (targetH - cur.h) * 0.24;

      box.style.transform = `translate3d(${cur.x - cur.w / 2}px, ${cur.y - cur.h / 2}px, 0)`;
      box.style.width = `${cur.w}px`;
      box.style.height = `${cur.h}px`;
    };

    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!visible) setVisible(true);

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a[href], button:not([disabled]), input, textarea, select",
      );

      if (!el) {
        lock = null;
        setMode("idle");
        setLabel("");
        return;
      }

      const declared = el.dataset.cursor as Mode | undefined;
      const next: Mode =
        declared ??
        (el.matches("input, textarea, select")
          ? "text"
          : "lock");

      setMode(next);
      setLabel(el.dataset.cursorLabel ?? "");

      if (next === "lock" || next === "drag") {
        const r = el.getBoundingClientRect();
        // Only snap to targets small enough that snapping reads as intent.
        if (r.width < window.innerWidth * 0.7 && r.height < 320) {
          lock = {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            w: r.width + 14,
            h: r.height + 14,
          };
        } else {
          lock = null;
        }
      } else {
        lock = null;
      }
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onScroll = () => {
      lock = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-hidden");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={boxRef}
      className={styles.reticle}
      data-mode={mode}
      data-down={down}
      data-visible={visible}
      aria-hidden="true"
    >
      <span className={styles.tick} data-c="tl" />
      <span className={styles.tick} data-c="tr" />
      <span className={styles.tick} data-c="bl" />
      <span className={styles.tick} data-c="br" />
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
