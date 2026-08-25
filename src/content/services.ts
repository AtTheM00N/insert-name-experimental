export type Service = {
  id: string;
  no: string;
  /** Department label, mono, in the frame chrome style. */
  dept: string;
  title: string;
  /** The one line that has to land. */
  claim: string;
  body: string;
  deliverables: string[];
  /** Honest, range-based. Not a guarantee. */
  window: string;
  signal: "signal" | "alert" | "bone";
};

export const SERVICES: Service[] = [
  {
    id: "websites",
    no: "01",
    dept: "WEB / EXPERIENCE",
    title: "Cinematic Websites",
    claim: "A website that behaves like a place, not a document.",
    body:
      "Art direction, interaction, motion and code decided together instead of handed down a chain. Built from an empty file — no theme, no page builder, no plugin stack holding the front door shut. The result loads fast, works on a four-year-old phone, and does not look like the last five sites you visited.",
    deliverables: [
      "Art direction",
      "Interaction design",
      "Custom build",
      "Motion system",
      "Copy structure",
      "Performance budget",
    ],
    window: "3–6 weeks",
    signal: "signal",
  },
  {
    id: "ads",
    no: "02",
    dept: "MEDIA / MOTION",
    title: "Cinematic Ads",
    claim: "Six seconds to beat the thumb.",
    body:
      "Short-form film cut like a trailer, not a slideshow with a logo bolted on the end. We work the first frame hardest, because that is the only one you are guaranteed. Delivered in every shape the feed asks for, sound designed to be optional — most people are watching you on mute.",
    deliverables: [
      "Concept + script",
      "Direction",
      "Edit + grade",
      "Sound design brief",
      "9:16 / 1:1 / 16:9 cutdowns",
    ],
    window: "1–3 weeks",
    signal: "alert",
  },
  {
    id: "search",
    no: "03",
    dept: "SEARCH / GROUND",
    title: "SEO & Local Search",
    claim: "Be the answer, not an option.",
    body:
      "Someone a few streets away is typing what you sell, right now, and picking from whoever shows up. Search is plumbing, not magic: fix what is technically broken, make the local presence unambiguous, and build pages around the questions people actually type. Then measure it, so nobody has to take our word for it.",
    deliverables: [
      "Technical audit",
      "Local presence",
      "Content architecture",
      "Internal linking",
      "Measurement + reporting",
    ],
    window: "Ongoing, monthly",
    signal: "bone",
  },
];
