"use client";

import { useEffect, useRef, useState } from "react";

/** Fires when the element enters the viewport, so expensive canvases are
 *  only asked to run while somebody can actually see them.
 *  With no IntersectionObserver at all, `inView` stays false and callers
 *  fall back to a single static frame — still a picture, just not a moving
 *  one. That is the correct trade on a browser that old. */
export function useInView<T extends HTMLElement>(
  options: { rootMargin?: string; threshold?: number; once?: boolean } = {},
) {
  const { rootMargin = "200px", threshold = 0, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}

/** Locks page scroll without the layout jumping when the scrollbar goes. */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const width = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--sb", `${width}px`);
    document.body.classList.add("is-locked");
    return () => {
      document.body.classList.remove("is-locked");
      document.documentElement.style.setProperty("--sb", "0px");
    };
  }, [locked]);
}
