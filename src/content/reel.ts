export type Frame = {
  id: string;
  /** Frame number on the reel. */
  no: string;
  /** Category, mono. */
  category: string;
  /** What this slot is reserved for. Honest: nothing here is a client yet. */
  title: string;
  brief: string;
  /** Procedural texture family — decides how the canvas draws this frame. */
  texture: "grid" | "scan" | "flow" | "grain" | "type";
  /** Aspect ratio of the plate. */
  ratio: "21:9" | "16:9" | "4:5" | "1:1";
  /** Seeds the deterministic procedural render. */
  seed: string;
  status: "unexposed" | "developing";
};

export const REEL_NOTE =
  "The studio is new. Rather than borrow someone else's work or invent a case study, the reel is held open — six frames, exposed as the work ships. What you can judge us on today is the thing you are currently looking at.";

/** Six open slots. The copy describes the kind of work each is reserved
 *  for, so the gallery reads as intent rather than absence. */
export const FRAMES: Frame[] = [
  {
    id: "frame-01",
    no: "01",
    category: "CINEMATIC WEBSITE",
    title: "Reserved — Hospitality",
    brief:
      "A room you can walk into before you book it. Held for a restaurant, hotel or venue where the feeling in the doorway is the product.",
    texture: "flow",
    ratio: "21:9",
    seed: "hospitality-01",
    status: "developing",
  },
  {
    id: "frame-02",
    no: "02",
    category: "CINEMATIC AD",
    title: "Reserved — Product Film",
    brief:
      "Six seconds, one object, no voiceover. Held for a maker whose product deserves to be shot like a character.",
    texture: "scan",
    ratio: "4:5",
    seed: "product-02",
    status: "unexposed",
  },
  {
    id: "frame-03",
    no: "03",
    category: "LOCAL SEARCH",
    title: "Reserved — Local Trade",
    brief:
      "Discoverable in the six streets that matter. Held for a trade or clinic whose next customer is already typing the question.",
    texture: "grid",
    ratio: "16:9",
    seed: "local-03",
    status: "unexposed",
  },
  {
    id: "frame-04",
    no: "04",
    category: "IDENTITY + WEB",
    title: "Reserved — Studio / Atelier",
    brief:
      "A mark, a motion language and a site that agree with each other. Held for a practice being seen properly for the first time.",
    texture: "type",
    ratio: "1:1",
    seed: "atelier-04",
    status: "developing",
  },
  {
    id: "frame-05",
    no: "05",
    category: "CINEMATIC WEBSITE",
    title: "Reserved — Premium Retail",
    brief:
      "Restraint as a sales technique. Held for a brand whose customer can tell the difference and expects you to know it.",
    texture: "grain",
    ratio: "16:9",
    seed: "retail-05",
    status: "unexposed",
  },
  {
    id: "frame-06",
    no: "06",
    category: "THE DOUBLE BILL",
    title: "Reserved — Launch",
    brief:
      "Site and film shipped the same week, in the same language. Held for whoever is going first.",
    texture: "flow",
    ratio: "21:9",
    seed: "launch-06",
    status: "unexposed",
  },
];

/** Live proof, stated as fact and verifiable in the page source. */
export const PROOF = [
  { k: "This site", v: "Built from an empty file" },
  { k: "Templates used", v: "Zero" },
  { k: "Stock images", v: "Zero — every frame is drawn in code" },
  { k: "Invented clients", v: "Zero" },
];
