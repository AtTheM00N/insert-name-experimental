"use client";

import { useEffect } from "react";
import { startCamera } from "@/lib/camera";
import { useExperience } from "@/lib/experience";

/* =========================================================================
   CAMERA
   Mounts the film's single scroll reader. No markup — it exists so the
   depth vocabulary has a lifecycle tied to React rather than to the module.

   Runs even under reduced motion: --t and --in are how the film knows where
   it is, and stylesheets decide whether to move because of them. A visitor
   who asked for stillness gets the numbers and no transforms.
   ========================================================================= */

export function Camera() {
  const { mounted } = useExperience();

  useEffect(() => {
    if (!mounted) return;
    return startCamera();
  }, [mounted]);

  return null;
}
