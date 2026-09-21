// A Visitor Card is one Visitor Gallery submission as it appears in the 3D card
// gallery: the visitor's drawing, its Drawing Name, and the visitor number it was
// issued. See CONTEXT.md for the vocabulary.

/** A point in normalized drawing space — 0..1 on both axes, origin top-left. */
export type Point = { x: number; y: number };

/** One continuous pen-down..pen-up line. A one-point stroke is a dot. */
export type Stroke = Point[];

export type VisitorCard = {
  id: string;
  /** Sequential, 1-based. Rendered on the card as "No. 007". */
  visitorNumber: number;
  /** [adjective] + [sketch-oracle noun], e.g. "Sleepy Cat". */
  drawingName: string;
  /** ISO date (YYYY-MM-DD) the card was issued. */
  issuedOn: string;
  strokes: Stroke[];
};

/* ------------------------------------------------------------------ *
 * Stroke authoring helpers
 *
 * The mock drawings below stand in for real visitor submissions until the
 * Edge Function is wired up (docs/adr/0002). They're built from primitives
 * rather than transcribed point lists so they stay readable and editable.
 * ------------------------------------------------------------------ */

const path = (...pts: [number, number][]): Stroke => pts.map(([x, y]) => ({ x, y }));

/** Angles in degrees, clockwise from 3 o'clock (y grows downward, as on a canvas). */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 28): Stroke {
  const pts: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return pts;
}

const ring = (cx: number, cy: number, rx: number, ry = rx): Stroke => arc(cx, cy, rx, ry, 0, 360);

function star(cx: number, cy: number, outer: number, inner: number, points = 5): Stroke {
  const pts: Stroke = [];
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

/** A closed lens from (x0,y0) to (x1,y1), bulged perpendicular — leaves, fins, petals. */
function leaf(x0: number, y0: number, x1: number, y1: number, bulge: number, steps = 14): Stroke {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const nx = -dy;
  const ny = dx;
  const side = (sign: number): Stroke =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = sign > 0 ? i / steps : 1 - i / steps;
      const s = Math.sin(t * Math.PI) * bulge * sign;
      return { x: x0 + dx * t + nx * s, y: y0 + dy * t + ny * s };
    });
  return [...side(1), ...side(-1)];
}

/** A vertical line with a sine wobble — tentacles, stems, streamers. */
function wave(x: number, yFrom: number, yTo: number, amp: number, phase: number, steps = 22): Stroke {
  const pts: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: x + Math.sin(t * Math.PI * 1.7 + phase) * amp, y: yFrom + (yTo - yFrom) * t });
  }
  return pts;
}

/* ------------------------------------------------------------------ *
 * Mock drawings — nouns are all from SKETCH_CATEGORIES, adjectives from
 * FUN_ADJECTIVES, so the names read like real sketch-oracle output.
 * ------------------------------------------------------------------ */

const CAT: Stroke[] = [
  ring(0.5, 0.55, 0.28, 0.25),
  path([0.31, 0.38], [0.33, 0.17], [0.49, 0.31]),
  path([0.69, 0.38], [0.67, 0.17], [0.51, 0.31]),
  arc(0.4, 0.55, 0.055, 0.045, 180, 360), // eyes shut — it's a sleepy cat
  arc(0.6, 0.55, 0.055, 0.045, 180, 360),
  path([0.47, 0.62], [0.5, 0.655], [0.53, 0.62]),
  arc(0.455, 0.665, 0.045, 0.035, 0, 180),
  arc(0.545, 0.665, 0.045, 0.035, 0, 180),
  path([0.21, 0.56], [0.34, 0.585]),
  path([0.21, 0.66], [0.34, 0.645]),
  path([0.79, 0.56], [0.66, 0.585]),
  path([0.79, 0.66], [0.66, 0.645]),
];

const STAR: Stroke[] = [
  star(0.5, 0.5, 0.33, 0.14),
  path([0.5, 0.06], [0.5, 0.005]),
  path([0.885, 0.325], [0.935, 0.3]),
  path([0.115, 0.325], [0.065, 0.3]),
  path([0.79, 0.87], [0.83, 0.915]),
  path([0.21, 0.87], [0.17, 0.915]),
];

const HOUSE: Stroke[] = [
  path([0.22, 0.46], [0.215, 0.82], [0.785, 0.825], [0.78, 0.455]),
  path([0.14, 0.48], [0.5, 0.19], [0.86, 0.47]),
  path([0.66, 0.335], [0.655, 0.2], [0.725, 0.2], [0.72, 0.39]),
  path([0.42, 0.825], [0.425, 0.62], [0.565, 0.625], [0.56, 0.825]),
  path([0.27, 0.54], [0.265, 0.665], [0.385, 0.67], [0.39, 0.545], [0.27, 0.54]),
  path([0.325, 0.542], [0.328, 0.668]),
  path([0.267, 0.605], [0.388, 0.607]),
];

const FLOWER: Stroke[] = [
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI * 2) / 6 - Math.PI / 2;
    return ring(0.5 + Math.cos(a) * 0.17, 0.4 + Math.sin(a) * 0.17, 0.105);
  }),
  ring(0.5, 0.4, 0.075),
  wave(0.5, 0.57, 0.92, 0.025, 0.4),
  leaf(0.49, 0.74, 0.28, 0.68, 0.3),
  leaf(0.51, 0.83, 0.72, 0.79, 0.3),
];

const FISH: Stroke[] = [
  ring(0.47, 0.55, 0.26, 0.18),
  path([0.72, 0.5], [0.91, 0.38], [0.9, 0.72], [0.72, 0.6]),
  ring(0.31, 0.49, 0.03),
  arc(0.46, 0.55, 0.085, 0.115, 118, 242),
  // Fin roots sit on the body ellipse so they read as attached, not floating.
  path([0.4, 0.377], [0.49, 0.25], [0.58, 0.387]),
  path([0.42, 0.727], [0.49, 0.83], [0.56, 0.719]),
  path([0.215, 0.57], [0.265, 0.6]),
];

const MUSHROOM: Stroke[] = [
  arc(0.5, 0.52, 0.31, 0.25, 180, 360),
  path([0.19, 0.52], [0.81, 0.52]),
  path([0.375, 0.53], [0.37, 0.77], [0.43, 0.83], [0.57, 0.83], [0.625, 0.77], [0.62, 0.53]),
  ring(0.39, 0.42, 0.05),
  ring(0.61, 0.45, 0.038),
  ring(0.51, 0.335, 0.032),
];

const CLOUD: Stroke[] = [
  arc(0.35, 0.52, 0.12, 0.13, 180, 360),
  arc(0.53, 0.52, 0.17, 0.2, 180, 360),
  arc(0.71, 0.52, 0.11, 0.12, 180, 360),
  path([0.23, 0.52], [0.82, 0.525]),
  path([0.54, 0.57], [0.44, 0.73], [0.53, 0.735], [0.45, 0.92]),
  path([0.3, 0.62], [0.26, 0.74]),
  path([0.72, 0.63], [0.68, 0.75]),
];

const OCTOPUS: Stroke[] = [
  arc(0.5, 0.44, 0.25, 0.27, 180, 360),
  path([0.25, 0.44], [0.255, 0.56]),
  path([0.75, 0.44], [0.745, 0.56]),
  ring(0.41, 0.41, 0.038),
  ring(0.59, 0.41, 0.038),
  arc(0.5, 0.5, 0.055, 0.045, 0, 180),
  wave(0.27, 0.56, 0.9, 0.05, 0.0),
  wave(0.39, 0.57, 0.93, 0.045, 1.1),
  wave(0.51, 0.575, 0.94, 0.045, 2.2),
  wave(0.63, 0.57, 0.93, 0.045, 3.3),
  wave(0.74, 0.56, 0.9, 0.05, 4.4),
];

export const MOCK_VISITOR_CARDS: VisitorCard[] = [
  { id: "v1", visitorNumber: 1, drawingName: "Sleepy Cat", issuedOn: "2026-08-29", strokes: CAT },
  { id: "v2", visitorNumber: 2, drawingName: "Radiant Star", issuedOn: "2026-09-02", strokes: STAR },
  { id: "v3", visitorNumber: 3, drawingName: "Wobbly House", issuedOn: "2026-09-06", strokes: HOUSE },
  { id: "v4", visitorNumber: 4, drawingName: "Cheerful Flower", issuedOn: "2026-09-09", strokes: FLOWER },
  { id: "v5", visitorNumber: 5, drawingName: "Suspicious Fish", issuedOn: "2026-09-12", strokes: FISH },
  { id: "v6", visitorNumber: 6, drawingName: "Peculiar Mushroom", issuedOn: "2026-09-15", strokes: MUSHROOM },
  { id: "v7", visitorNumber: 7, drawingName: "Dramatic Cloud", issuedOn: "2026-09-18", strokes: CLOUD },
  { id: "v8", visitorNumber: 8, drawingName: "Nosy Octopus", issuedOn: "2026-09-19", strokes: OCTOPUS },
];

/** Local date as YYYY-MM-DD. Built by hand because toISOString() reports UTC, which
 *  rolls a California evening over to tomorrow's date. */
function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Issues the next card in the series — the visitor number is the gallery's, not the card's. */
export function issueVisitorCard(existing: VisitorCard[], strokes: Stroke[], drawingName: string): VisitorCard {
  const visitorNumber = existing.reduce((max, card) => Math.max(max, card.visitorNumber), 0) + 1;
  return {
    id: `card-${visitorNumber}-${Date.now()}`,
    visitorNumber,
    drawingName,
    issuedOn: todayIso(),
    strokes,
  };
}
