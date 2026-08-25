"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Shot } from "@/content/shots";

/* =========================================================================
   SHOTS
   The film is cut into shots. Exactly one shot owns the middle of the
   viewport at any time — that's the one the frame chrome reports.
   ========================================================================= */

type ShotsValue = {
  shots: Shot[];
  activeId: string;
  activeIndex: number;
};

const ShotsContext = createContext<ShotsValue | null>(null);

export function ShotsProvider({ shots, children }: { shots: Shot[]; children: ReactNode }) {
  const [activeId, setActiveId] = useState(shots[0]?.id ?? "");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-shot]"));
    if (!nodes.length || typeof IntersectionObserver === "undefined") return;

    // The -46%/-46% inset leaves a thin band across the viewport middle;
    // whichever shot crosses it is the shot we're watching.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.shot;
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [shots]);

  const value = useMemo<ShotsValue>(() => {
    const index = shots.findIndex((s) => s.id === activeId);
    return {
      shots,
      activeId,
      activeIndex: index < 0 ? 0 : index,
    };
  }, [shots, activeId]);

  return <ShotsContext.Provider value={value}>{children}</ShotsContext.Provider>;
}

export function useShots() {
  const ctx = useContext(ShotsContext);
  if (!ctx) throw new Error("useShots must be used inside <ShotsProvider>");
  return ctx;
}
