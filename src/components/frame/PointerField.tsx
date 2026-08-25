"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/experience";
import { pointer, subscribePointer } from "@/lib/pointer";

/* =========================================================================
   POINTER FIELD
   The one place the light is published to CSS. It subscribes to the shared
   pointer store and writes :root variables — but only when a number has
   moved far enough to be worth a style invalidation, because every write
   here dirties every element that references it.

     --px / --py        pixel position
     --px-n / --py-n    normalised 0..1
     --pointer-in       0 or 1
     --pointer-speed    0..1, how fast the light is travelling

   Nothing else on the site reads these back out of the DOM; JS consumers
   import the store directly.
   ========================================================================= */

export function PointerField() {
  const { mounted } = useExperience();

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let lx = -1;
    let ly = -1;
    let lin = -1;
    let lsp = -1;

    return subscribePointer(() => {
      /* Half a pixel is below the threshold of anything we draw with these,
         and skipping the write skips a whole style pass. */
      if (Math.abs(pointer.x - lx) > 0.5 || Math.abs(pointer.y - ly) > 0.5) {
        lx = pointer.x;
        ly = pointer.y;
        root.style.setProperty("--px", `${lx.toFixed(1)}px`);
        root.style.setProperty("--py", `${ly.toFixed(1)}px`);
        root.style.setProperty("--px-n", pointer.nx.toFixed(4));
        root.style.setProperty("--py-n", pointer.ny.toFixed(4));
      }

      if (pointer.inside !== lin) {
        lin = pointer.inside;
        root.style.setProperty("--pointer-in", String(lin));
      }

      const sp = Math.round(pointer.speed * 20) / 20;
      if (sp !== lsp) {
        lsp = sp;
        root.style.setProperty("--pointer-speed", String(sp));
      }
    });
  }, [mounted]);

  return null;
}
