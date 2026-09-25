// Paints one Visitor Card onto a 2D canvas. That canvas becomes the texture on
// the card's plane in the 3D gallery, so everything the card says — the drawing,
// the Drawing Name, the visitor number — is drawn here, not composited in the DOM.

import type { Stroke, VisitorCard } from "../data/visitorCards";

const TEX_W = 1100;
const TEX_H = 620;

/**
 * Aspect of the whole texture, padding included — the card plane must match this
 * or the face is stretched, since the full texture maps across the full quad.
 */
export const CARD_ASPECT = TEX_W / TEX_H;

/** Breathing room around the face so the baked drop shadow isn't clipped. */
const PAD = 28;
const CARD_X = PAD;
const CARD_Y = PAD;
const CARD_W = TEX_W - PAD * 2;
const CARD_H = TEX_H - PAD * 2;

// The drawing lives on the left side of the card, behind a perforated divider —
// the text side sits to its right, like a ticket stub.
const PANEL_SIZE = 380;
const PANEL_X = CARD_X + 36;
const PANEL_Y = CARD_Y + (CARD_H - PANEL_SIZE) / 2;
const DIVIDER_X = PANEL_X + PANEL_SIZE + 26;
const TEXT_X = DIVIDER_X + 34;
const TEXT_W = CARD_X + CARD_W - 36 - TEXT_X;

const FONT_DISPLAY = 'Georgia, "Iowan Old Style", "Times New Roman", serif';
const FONT_BODY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const FONT_MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const INK = "#ffffff";
const INK_DIM = "#a0a0a0";
const INK_FAINT = "#7a7a7a";
const SURFACE = "#171717";
const SURFACE_INSET = "#0f0f0f";
const BORDER = "#2f2f2f";
// No accent color in this variant — the visitor number reads in plain white.
const ACCENT = "#ffffff";

/** ISO (YYYY-MM-DD) -> MM/DD/YY, parsed by hand so the local timezone can't shift the day. */
export function formatIssuedOn(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

export function formatVisitorNumber(n: number): string {
  return `No. ${String(n).padStart(3, "0")}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Fits a drawing into the panel by its own bounding box rather than assuming it
 * fills 0..1 — a real visitor may have drawn small, or in one corner.
 */
function paintDrawing(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  const points = strokes.flat();
  if (points.length === 0) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  const inset = 46;
  const box = PANEL_SIZE - inset * 2;
  // A dot or a perfectly straight line has zero extent on one axis; the floor
  // keeps the scale finite and stops it from being blown up to fill the panel.
  const scale = Math.min(box / Math.max(maxX - minX, 0.2), box / Math.max(maxY - minY, 0.2));
  const offsetX = PANEL_X + PANEL_SIZE / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = PANEL_Y + PANEL_SIZE / 2 - ((minY + maxY) / 2) * scale;
  const tx = (x: number) => offsetX + x * scale;
  const ty = (y: number) => offsetY + y * scale;

  ctx.save();
  roundRect(ctx, PANEL_X, PANEL_Y, PANEL_SIZE, PANEL_SIZE, 18);
  ctx.clip();

  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 7.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    if (stroke.length === 1) {
      ctx.beginPath();
      ctx.arc(tx(stroke[0].x), ty(stroke[0].y), ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // Curve through stroke midpoints so replayed pointer samples read as a
    // smooth pen line instead of a chain of visible segments.
    ctx.beginPath();
    ctx.moveTo(tx(stroke[0].x), ty(stroke[0].y));
    for (let i = 1; i < stroke.length - 1; i++) {
      const midX = (stroke[i].x + stroke[i + 1].x) / 2;
      const midY = (stroke[i].y + stroke[i + 1].y) / 2;
      ctx.quadraticCurveTo(tx(stroke[i].x), ty(stroke[i].y), tx(midX), ty(midY));
    }
    const last = stroke[stroke.length - 1];
    ctx.lineTo(tx(last.x), ty(last.y));
    ctx.stroke();
  }

  ctx.restore();
}

/** Wraps `text` to `maxWidth`, shrinking the type until it fits `maxLines`. */
function fitLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  for (let size = 54; size >= 30; size -= 3) {
    ctx.font = `${size}px ${FONT_DISPLAY}`;
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
      return { lines, size };
    }
  }
  return { lines: [text], size: 30 };
}

export function drawVisitorCardFace(ctx: CanvasRenderingContext2D, card: VisitorCard) {
  ctx.clearRect(0, 0, TEX_W, TEX_H);

  // Card body, with the shadow baked in so the plane reads as lifted off the page.
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = SURFACE;
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, 28);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, 28);
  ctx.stroke();

  // Drawing panel: inset well with the site's dot-grid texture behind the strokes.
  ctx.fillStyle = SURFACE_INSET;
  roundRect(ctx, PANEL_X, PANEL_Y, PANEL_SIZE, PANEL_SIZE, 18);
  ctx.fill();

  ctx.save();
  roundRect(ctx, PANEL_X, PANEL_Y, PANEL_SIZE, PANEL_SIZE, 18);
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
  for (let gx = PANEL_X + 12; gx < PANEL_X + PANEL_SIZE; gx += 26) {
    for (let gy = PANEL_Y + 12; gy < PANEL_Y + PANEL_SIZE; gy += 26) {
      ctx.fillRect(gx, gy, 2, 2);
    }
  }
  ctx.restore();

  paintDrawing(ctx, card.strokes);

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  roundRect(ctx, PANEL_X, PANEL_Y, PANEL_SIZE, PANEL_SIZE, 18);
  ctx.stroke();

  // Perforated divider between the drawing side and the text side.
  ctx.save();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 10]);
  ctx.beginPath();
  ctx.moveTo(DIVIDER_X, CARD_Y + 34);
  ctx.lineTo(DIVIDER_X, CARD_Y + CARD_H - 34);
  ctx.stroke();
  ctx.restore();

  // Accent square, top-right — the same confetti language used across the site.
  ctx.fillStyle = ACCENT;
  ctx.fillRect(CARD_X + CARD_W - 52, CARD_Y + 38, 12, 12);

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.save();
  ctx.letterSpacing = "5px";
  ctx.font = `600 19px ${FONT_MONO}`;
  ctx.fillStyle = INK_FAINT;
  ctx.fillText("VISITOR", TEXT_X, CARD_Y + 64);
  ctx.restore();

  const { lines, size } = fitLines(ctx, card.drawingName, TEXT_W, 2);
  const lineHeight = size * 1.14;

  // Centre the name + date between the eyebrow and the visitor number, so a
  // one-line name doesn't leave a dead band above the number.
  const numberBaseline = CARD_Y + CARD_H - 54;
  const regionTop = CARD_Y + 128;
  const regionBottom = numberBaseline - 66;
  const blockHeight = lines.length * lineHeight + 20 + 21;
  const nameTop = Math.max(regionTop, regionTop + (regionBottom - regionTop - blockHeight) / 2);

  ctx.fillStyle = INK;
  ctx.font = `${size}px ${FONT_DISPLAY}`;
  lines.forEach((line, i) => ctx.fillText(line, TEXT_X, nameTop + i * lineHeight));

  ctx.font = `21px ${FONT_BODY}`;
  ctx.fillStyle = INK_DIM;
  ctx.fillText(`Issued on ${formatIssuedOn(card.issuedOn)}`, TEXT_X, nameTop + lines.length * lineHeight + 20);

  ctx.textBaseline = "alphabetic";
  ctx.font = `600 44px ${FONT_MONO}`;
  ctx.fillStyle = ACCENT;
  ctx.fillText(formatVisitorNumber(card.visitorNumber), TEXT_X, numberBaseline);
}

export function createVisitorCardCanvas(card: VisitorCard): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (ctx) drawVisitorCardFace(ctx, card);
  return canvas;
}
