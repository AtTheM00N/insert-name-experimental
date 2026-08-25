export type Shot = {
  id: string;
  /** Two-digit shot number as it appears in the frame chrome. */
  no: string;
  /** Short name shown in the rail. */
  label: string;
  /** Slate line — screenplay slugline for the section. */
  slate: string;
  /** Mark on the reel. Diegetic: it positions the shot in the film. */
  mark: string;
};

/** The cut list. Order here is the order of the film, and it drives both
 *  the rail navigation and the label in the letterbox bar. */
export const SHOTS: Shot[] = [
  {
    id: "dark",
    no: "01",
    label: "The Dark",
    slate: "INT. A DARK ROOM — BEFORE THE LIGHT",
    mark: "00:00",
  },
  {
    id: "template",
    no: "02",
    label: "The Comparison",
    slate: "EXT. THE INTERNET — EVERY SINGLE DAY",
    mark: "01:12",
  },
  {
    id: "reel",
    no: "03",
    label: "The Reel",
    slate: "INT. THE CUTTING ROOM — UNEXPOSED",
    mark: "03:04",
  },
  {
    id: "lenses",
    no: "04",
    label: "The Lenses",
    slate: "INSERT — THREE WAYS TO MAKE PEOPLE LOOK",
    mark: "05:20",
  },
  {
    id: "terms",
    no: "05",
    label: "The Terms",
    slate: "INT. BOX OFFICE — NO SMALL PRINT",
    mark: "08:02",
  },
  {
    id: "invitation",
    no: "06",
    label: "The Invitation",
    slate: "EXT. YOUR NEXT CHAPTER — DAWN",
    mark: "10:16",
  },
];
