/**
 * Silhouette shared by the project card's clip-path and its SVG border.
 *
 * These two MUST agree exactly — if they drift you get a halo, or the square
 * card background peeking out from under the stroke. Previously the shape was
 * declared twice (`.chamfered-all` in CSS, `C = 16` in HUDCardFrame); with a
 * stepped outline of 30-odd vertices that duplication is untenable, so both
 * consumers now derive from the one point list below.
 *
 * Coordinates are px offsets, expressed relative to an edge or the centre, so
 * the CSS form needs no measurement and is correct from the first paint.
 */

export type Coord =
  | number            // px from the start edge
  | { end: number }   // px from the end edge
  | { mid: number };  // px from the centre (signed)

export const FRAME = {
  C:   20, // corner reach
  S:    8, // step size within a corner
  KEY: 42, // keyed corner — one long diagonal, twice the other corners
  ND:   6, // side notch depth
  NH:  34, // side notch height
  NW:  46, // bottom notch width
  NDB:  7, // bottom notch depth
  NOFF: 74, // bottom notch offset right of centre
  IN:   5, // inset of the inner parallel border
} as const;

const { C, S, KEY, ND, NH, NW, NDB, NOFF } = FRAME;
const NH2 = NH / 2;
const NW2 = NW / 2;

/** Clockwise from the start of the top edge. */
export const FRAME_POINTS: Array<[Coord, Coord]> = [
  // top edge — starts past the keyed corner
  [KEY, 0],
  [{ end: C }, 0],
  // top-right corner — two-step stair down to the right edge
  [{ end: C }, S],
  [{ end: S }, S],
  [{ end: S }, C],
  [{ end: 0 }, C],
  // right edge notch
  [{ end: 0 }, { mid: -NH2 }],
  [{ end: ND }, { mid: -NH2 }],
  [{ end: ND }, { mid: NH2 }],
  [{ end: 0 }, { mid: NH2 }],
  // bottom-right corner
  [{ end: 0 }, { end: C }],
  [{ end: S }, { end: C }],
  [{ end: S }, { end: S }],
  [{ end: C }, { end: S }],
  [{ end: C }, { end: 0 }],
  // bottom edge notch
  [{ mid: NOFF + NW2 }, { end: 0 }],
  [{ mid: NOFF + NW2 }, { end: NDB }],
  [{ mid: NOFF - NW2 }, { end: NDB }],
  [{ mid: NOFF - NW2 }, { end: 0 }],
  // bottom-left corner
  [C, { end: 0 }],
  [C, { end: S }],
  [S, { end: S }],
  [S, { end: C }],
  [0, { end: C }],
  // left edge notch
  [0, { mid: NH2 }],
  [ND, { mid: NH2 }],
  [ND, { mid: -NH2 }],
  [0, { mid: -NH2 }],
  // top-left — the key: one long diagonal, not a stair. This asymmetry is what
  // reads as a component rather than a decorative frame.
  [0, KEY],
];

function toCss(c: Coord): string {
  if (typeof c === "number") return `${c}px`;
  if ("end" in c) return c.end === 0 ? "100%" : `calc(100% - ${c.end}px)`;
  if (c.mid === 0) return "50%";
  return c.mid > 0 ? `calc(50% + ${c.mid}px)` : `calc(50% - ${-c.mid}px)`;
}

function toNum(c: Coord, size: number): number {
  if (typeof c === "number") return c;
  if ("end" in c) return size - c.end;
  return size / 2 + c.mid;
}

/** CSS clip-path for the card body. Resolution-independent — no measuring. */
export function frameClipPath(): string {
  const pts = FRAME_POINTS.map(([x, y]) => `${toCss(x)} ${toCss(y)}`).join(", ");
  return `polygon(${pts})`;
}

/** SVG path for the border stroke, at a measured size. */
export function framePath(w: number, h: number): string {
  const d = FRAME_POINTS.map(
    ([x, y], i) => `${i ? "L" : "M"} ${toNum(x, w)},${toNum(y, h)}`
  ).join(" ");
  return `${d} Z`;
}
