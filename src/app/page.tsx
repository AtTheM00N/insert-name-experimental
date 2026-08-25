import { Dark } from "@/components/shots/Dark";
import { Template } from "@/components/shots/Template";
import { Reel } from "@/components/shots/Reel";
import { Lenses } from "@/components/shots/Lenses";
import { Terms } from "@/components/shots/Terms";
import { Invitation } from "@/components/shots/Invitation";
import { GateSplice } from "@/components/frame/Gate";

/* =========================================================================
   THE FILM
   Six shots, in cut order. The hairlines between them are splices — the
   only decoration on the page that means something.

   01  Dark        the room, and the light in the visitor's hand
   02  Template    the argument, made physical and draggable
   03  Reel        the work, as a strip of film
   04  Lenses      three ways to make people look
   05  Terms       the prices, in the open
   06  Invitation  the last frame, handed over

   The first splice is not a hairline but a gate: the light the visitor was
   holding becomes the frame they watch the rest of it through. Everything
   that transition needs is a scroll position, which is why it lives in a
   1px element and a stylesheet.
   ========================================================================= */

export default function Film() {
  return (
    <>
      <Dark />
      <GateSplice />
      <Template />
      <hr className="hairline" />
      <Reel />
      <hr className="hairline" />
      <Lenses />
      <hr className="hairline" />
      <Terms />
      <hr className="hairline" />
      <Invitation />
    </>
  );
}
