"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/experience";

/* =========================================================================
   REVEAL ENGINE
   One IntersectionObserver for the whole film. Anything marked [data-rack]
   gets its focus pulled when it crosses into frame, then has its compositor
   layer released so nothing keeps paying for an animation that finished.
   New nodes (route changes, expanded panels) are picked up automatically.
   ========================================================================= */

export function RevealEngine() {
  const { mounted, reducedMotion } = useExperience();

  useEffect(() => {
    if (!mounted) return;

    const settle = (el: HTMLElement) => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue("--rack-delay")) || 0;
      window.setTimeout(
        () => el.setAttribute("data-settled", "true"),
        delay + 1100,
      );
    };

    /* Asked to sit still: everything is simply already in frame. */
    if (reducedMotion) {
      document.querySelectorAll<HTMLElement>("[data-rack]").forEach((el) => {
        el.setAttribute("data-in", "true");
        el.setAttribute("data-settled", "true");
      });
      return;
    }

    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.setAttribute("data-in", "true");
          settle(el);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );

    const collect = (root: ParentNode) => {
      const nodes = root.querySelectorAll<HTMLElement>("[data-rack]:not([data-in])");
      nodes.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    collect(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as HTMLElement;
          if (el.matches?.("[data-rack]:not([data-in])") && !seen.has(el)) {
            seen.add(el);
            io.observe(el);
          }
          collect(el);
        });
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [mounted, reducedMotion]);

  return null;
}
