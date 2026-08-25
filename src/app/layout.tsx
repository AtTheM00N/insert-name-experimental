import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { ExperienceProvider } from "@/lib/experience";
import { ShotsProvider } from "@/lib/shots";
import { SITE_URL } from "@/lib/site";

import { Projector } from "@/components/frame/Projector";
import { PointerField } from "@/components/frame/PointerField";
import { Camera } from "@/components/frame/Camera";
import { RevealEngine } from "@/components/frame/RevealEngine";
import { Reticle } from "@/components/frame/Reticle";
import { Grain } from "@/components/frame/Grain";
import { Gate } from "@/components/frame/Gate";
import { Letterbox } from "@/components/frame/Letterbox";
import { Rail } from "@/components/frame/Rail";
import { Boot } from "@/components/frame/Boot";
import { Blank } from "@/components/frame/Blank";
import { Credits } from "@/components/frame/Credits";

import { SHOTS } from "@/content/shots";
import { STUDIO } from "@/content/studio";
import { SERVICES } from "@/content/services";
import { TIERS } from "@/content/pricing";

/* =========================================================================
   THE FRAME
   Everything that isn't a shot lives here: the light, the grain, the bars,
   the rail, the leader, the secret and the credits. The shots themselves
   are the only thing that changes.
   ========================================================================= */

/* ka1 and VT323 are the studio's own faces, carried over from its first
   build. They're the only fonts on the wire — the display face is native,
   because the biggest type on the page should paint on the first frame. */
const fontMark = localFont({
  src: "../fonts/ka1.ttf",
  variable: "--f-mark",
  display: "swap",
  weight: "400",
  style: "normal",
  preload: true,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Courier New", "monospace"],
});

const fontMono = localFont({
  src: "../fonts/VT323-Regular.ttf",
  variable: "--f-mono",
  display: "swap",
  weight: "400",
  style: "normal",
  preload: true,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const TITLE = `${STUDIO.placeholder} — ${STUDIO.role}`;
const DESCRIPTION = `${STUDIO.thesis} ${STUDIO.short}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${STUDIO.placeholder}`,
  },
  description: DESCRIPTION,
  applicationName: STUDIO.placeholder,
  generator: "Next.js",
  keywords: [
    "cinematic website design",
    "custom website development",
    "video ad production",
    "short-form video advertising",
    "local SEO",
    "independent digital studio",
    "creative studio",
    "web design India",
  ],
  authors: [{ name: STUDIO.placeholder, url: SITE_URL }],
  creator: STUDIO.placeholder,
  publisher: STUDIO.placeholder,
  category: "design",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: STUDIO.placeholder,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  other: {
    /* Said quietly, in the one place a curious person looks first. */
    "x-insert-name": "The underscore is a door. Press / to open it.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#050505",
};

/* -------------------------------------------------------------------------
   Structured data. Every figure below is quoted from the studio's own rate
   sheet — there is nothing here that isn't also visible on the page.
   ------------------------------------------------------------------------- */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${SITE_URL}/#studio`,
      name: STUDIO.placeholder,
      url: SITE_URL,
      email: STUDIO.email,
      description: STUDIO.long,
      slogan: STUDIO.thesis,
      knowsAbout: STUDIO.disciplines,
      priceRange: "₹3,000–₹5,000",
      currenciesAccepted: "INR",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Rate sheet",
        itemListElement: TIERS.map((tier) => ({
          "@type": "Offer",
          name: tier.name,
          sku: tier.serial,
          description: tier.line,
          price: tier.amount,
          priceCurrency: "INR",
          category: tier.addon ? "Add-on" : "Build",
          url: `${SITE_URL}/#terms`,
        })),
      },
      makesOffer: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.claim,
          serviceType: service.dept,
        },
        url: `${SITE_URL}/#lenses`,
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      url: SITE_URL,
      name: STUDIO.placeholder,
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#studio` },
    },
  ],
};

/* Without JavaScript the film doesn't move — but every word of it must
   still be there. The reveal layer defaults to invisible, so it gets
   forced open, and the decorative light is removed entirely. */
const NOSCRIPT_CSS = `<style>
[data-rack]{opacity:1!important;transform:none!important;filter:none!important}
.projector{display:none!important}
</style>`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontMark.variable} ${fontMono.variable}`}>
      <body>
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />

        <ExperienceProvider>
          <ShotsProvider shots={SHOTS}>
            <a href="#film" className="skip">
              Skip to the film
            </a>

            {/* ---- the room ---- */}
            <Projector />
            <Grain />

            {/* ---- the machinery: no markup, all behaviour ---- */}
            <PointerField />
            <Camera />
            <RevealEngine />
            <Reticle />

            {/* ---- the frame chrome ---- */}
            <Letterbox />
            <Rail />

            <main id="film">{children}</main>

            {/* The handoff between the first two shots. Mounted here, at the
                root, so nothing in the film can ever become the containing
                block of a layer that has to be welded to the viewport. */}
            <Gate />

            <Credits />

            {/* ---- the secret, and the leader that covers it all ---- */}
            <Blank />
            <Boot />
          </ShotsProvider>
        </ExperienceProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
