/* =========================================================================
   STUDIO — single source of truth for brand facts.
   Nothing here is invented: prices, email and mark carry over from the
   studio's own first build.
   ========================================================================= */

export const STUDIO = {
  placeholder: "INSERT_NAME",
  mark: { open: "[", insert: "INSERT", blank: "_", name: "NAME", close: "]" },
  role: "Independent digital studio",
  email: "hello@insert-name.com",
  year: 2026,
  reel: "REEL 01",
  thesis: "Your business deserves more than a template.",
  short:
    "Cinematic websites, cinematic ads and search presence for businesses that refuse to look like everyone else.",
  long:
    "INSERT_NAME is an independent digital studio. We build websites that behave like places, short film that survives the scroll, and search presence that puts you in front of people already looking for you.",
  disciplines: ["Design", "Motion", "Code", "Search"],
} as const;

/** Said out loud, in order, in the credits strip. Every line is a promise we
 *  can actually keep — which is why they're all negatives. */
export const MANIFESTO = [
  "No templates",
  "No stock photography",
  "No invented numbers",
  "No autoplay audio",
  "No cookie theatre",
  "No “passionate team of creatives”",
  "No carousels nobody clicks",
  "No 40 plugins holding the door shut",
] as const;
