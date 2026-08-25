export type Tier = {
  id: string;
  no: string;
  name: string;
  /** Displayed price. Kept exactly as the studio quotes it. */
  price: string;
  currency: string;
  amount: number;
  unit: string;
  line: string;
  includes: string[];
  /** Deliberately stated, so the price never needs a phone call to explain. */
  notes: string;
  serial: string;
  emphasis?: boolean;
  addon?: boolean;
};

export const PRICING_NOTE =
  "Fixed prices, stated up front. A build is quoted from this sheet, not from what your website looks like it can afford. Scope changes are quoted before they happen — never after.";

export const TIERS: Tier[] = [
  {
    id: "web",
    no: "001",
    name: "The Website",
    price: "4,000",
    currency: "₹",
    amount: 4000,
    unit: "per build",
    line: "One cinematic site, built from an empty file.",
    includes: [
      "Art direction",
      "Custom build — no template",
      "Motion system",
      "Responsive to 320px",
      "Performance + accessibility pass",
      "Launch support",
    ],
    notes: "Hosting and domain are yours, billed by whoever you choose. We set them up at no charge.",
    serial: "IN-4000",
  },
  {
    id: "ad",
    no: "002",
    name: "The Ad",
    price: "3,000",
    currency: "₹",
    amount: 3000,
    unit: "per film",
    line: "One short film cut to survive the scroll.",
    includes: [
      "Concept + script",
      "Direction",
      "Edit + colour",
      "Vertical, square and wide cutdowns",
      "Two rounds of revision",
      "Delivery masters",
    ],
    notes: "Licensed music and paid talent, if the concept needs them, are billed at cost with your approval first.",
    serial: "IN-3000",
  },
  {
    id: "double",
    no: "003",
    name: "The Double Bill",
    price: "5,000",
    currency: "₹",
    amount: 5000,
    unit: "per launch",
    line: "The site and the film, made by the same hands, in the same language.",
    includes: [
      "Everything in The Website",
      "Everything in The Ad",
      "One shared art direction",
      "Film cut into the site",
      "Coordinated launch",
    ],
    notes: "The reason this costs less than the two apart: one direction, decided once, used twice.",
    serial: "IN-5000",
    emphasis: true,
  },
  {
    id: "seo",
    no: "004",
    name: "Search",
    price: "500",
    currency: "+₹",
    amount: 500,
    unit: "added to any build",
    line: "Be findable by the people already looking.",
    includes: [
      "Technical audit + fixes",
      "Local profile setup",
      "Keyword + intent map",
      "On-page structure",
      "Monthly report",
    ],
    notes: "Rankings are never promised. The work and the numbers are both shown to you in full.",
    serial: "IN-0500",
    addon: true,
  },
];
