import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { STUDIO } from "@/content/studio";

/* =========================================================================
   THE CARD
   The one frame of this film that has to work as a still, in somebody
   else's feed, at thumbnail size. Same rules as the site: no photograph,
   no gradient mesh, no glow. A dark room, one light, and the mark.
   ========================================================================= */

export const alt = `${STUDIO.placeholder} — ${STUDIO.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#050505";
const BONE = "#f4f2ed";
const SIGNAL = "#64afdb";
const LINE = "rgba(244, 242, 237, 0.24)";

/** Crop marks, one per corner — the site's own framing device.
 *  Satori hands shorthand values straight to css-to-react-native, which
 *  trims them, so a key present with an `undefined` value throws. Every
 *  side is spread in only when it's actually wanted. */
function Crop({ x, y }: { x: "left" | "right"; y: "top" | "bottom" }) {
  const rule = `2px solid ${LINE}`;
  return (
    <div
      style={{
        position: "absolute",
        width: 26,
        height: 26,
        ...(y === "top" ? { top: 44, borderTop: rule } : { bottom: 44, borderBottom: rule }),
        ...(x === "left" ? { left: 44, borderLeft: rule } : { right: 44, borderRight: rule }),
      }}
    />
  );
}

export default async function OpenGraphImage() {
  const [markFont, monoFont] = await Promise.all([
    readFile(join(process.cwd(), "src", "fonts", "ka1.ttf")),
    readFile(join(process.cwd(), "src", "fonts", "VT323-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background: INK,
          fontFamily: "VT323",
          color: BONE,
          padding: "72px 84px",
        }}
      >
        {/* the light */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 24% 30%, rgba(100,175,219,0.30), rgba(100,175,219,0.07) 34%, rgba(5,5,5,0) 64%)",
          }}
        />

        {/* the gate: scan lines, drawn rather than filtered */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                height: 1,
                marginBottom: 13,
                background: "rgba(5,5,5,0.55)",
              }}
            />
          ))}
        </div>

        <Crop x="left" y="top" />
        <Crop x="right" y="top" />
        <Crop x="left" y="bottom" />
        <Crop x="right" y="bottom" />

        {/* ---- top slate ---- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            letterSpacing: 3,
            color: "#8a8a8a",
          }}
        >
          <span>{STUDIO.reel} — INT. A DARK ROOM</span>
          <span style={{ color: SIGNAL }}>● REC</span>
        </div>

        {/* ---- the mark and the line ---- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "ka1",
              fontSize: 68,
              letterSpacing: 2,
            }}
          >
            <span style={{ color: SIGNAL }}>[</span>
            <span>{STUDIO.mark.insert}</span>
            <span style={{ color: SIGNAL }}>{STUDIO.mark.blank}</span>
            <span>{STUDIO.mark.name}</span>
            <span style={{ color: SIGNAL }}>]</span>
          </div>

          <div style={{ display: "flex", width: 220, height: 1, background: LINE }} />

          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.05,
              maxWidth: 900,
              letterSpacing: 1,
            }}
          >
            {STUDIO.thesis}
          </div>
        </div>

        {/* ---- foot ---- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            letterSpacing: 3,
            color: "#8a8a8a",
          }}
        >
          <span>{STUDIO.disciplines.join("  ·  ")}</span>
          <span>{STUDIO.email}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "ka1", data: markFont, style: "normal", weight: 400 },
        { name: "VT323", data: monoFont, style: "normal", weight: 400 },
      ],
    },
  );
}
