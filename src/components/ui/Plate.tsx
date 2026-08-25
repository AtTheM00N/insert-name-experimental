"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";
import { useInView } from "@/lib/hooks";
import { PALETTE, drawPlate, plateResolution, type RGB, type TextureKind } from "@/lib/plate";
import { cx, hashString } from "@/lib/utils";

type PlateProps = {
  kind: TextureKind;
  seed: string;
  hi?: RGB;
  lo?: RGB;
  /** Pixel chunk size. Bigger = chunkier, cheaper. */
  chunk?: number;
  /** Animate the field, if the machine allows it. */
  live?: boolean;
  /** External 0..1 hover/scroll intensity, read each frame. */
  intensityRef?: { current: number };
  className?: string;
};

/**
 * A generated picture. Renders at ~1/7 scale onto a canvas, then lets the
 * browser upscale with nearest-neighbour — so one plate costs a few thousand
 * pixels of work instead of a few million.
 */
export function Plate({
  kind,
  seed,
  hi = PALETTE.bone,
  lo = PALETTE.dim,
  chunk = 7,
  live = true,
  intensityRef,
  className,
}: PlateProps) {
  const { canAnimateTexture, reducedMotion, mounted } = useExperience();
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>({ rootMargin: "320px", once: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animate = live && canAnimateTexture && inView;

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const numericSeed = hashString(seed);
    let cols = 0;
    let rows = 0;
    let image: ImageData | null = null;
    let raf = 0;
    let start = 0;
    let disposed = false;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      cols = plateResolution(rect.width, chunk);
      rows = Math.max(24, Math.round(cols * (rect.height / rect.width)));
      canvas.width = cols;
      canvas.height = rows;
      image = ctx.createImageData(cols, rows);
      ctx.imageSmoothingEnabled = false;
      return true;
    };

    const paint = (t: number, develop: number) => {
      if (!image) return;
      const boost = intensityRef ? intensityRef.current * 0.3 : 0;
      drawPlate(image.data, cols, rows, {
        kind,
        seed: numericSeed,
        t,
        hi,
        lo,
        exposure: boost,
        develop,
      });
      ctx.putImageData(image, 0, 0);
    };

    if (!resize()) return;

    /* Static machines (or a visitor who asked for stillness) get one frame,
       developed straight in. */
    if (!animate) {
      paint(numericSeed % 40, 1);
      const ro = new ResizeObserver(() => {
        if (resize()) paint(numericSeed % 40, 1);
      });
      ro.observe(wrap);
      return () => ro.disconnect();
    }

    // Cap the plate at ~24fps. It's film; it shouldn't run at 120.
    const frameMs = 1000 / 24;
    let last = -Infinity;

    const loop = (now: number) => {
      if (disposed) return;
      if (!start) start = now;
      if (now - last >= frameMs) {
        last = now;
        const elapsed = (now - start) / 1000;
        // 900ms chemical develop on first appearance.
        const develop = reducedMotion ? 1 : Math.min(1, elapsed / 0.9);
        paint(elapsed, develop);
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = -Infinity;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, animate, kind, seed, chunk, reducedMotion]);

  return (
    <div ref={wrapRef} className={cx("plate", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="plate-canvas" />
    </div>
  );
}
