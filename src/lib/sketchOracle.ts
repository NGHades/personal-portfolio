// Client-side inference for sketch-oracle, Richie's CNN that guesses the noun
// class of a Visitor Gallery drawing. Runs entirely in-browser via LiteRT Web's
// WASM runtime — see docs/adr/0001-client-side-sketch-oracle-inference.md.
import { loadAndCompile, loadLiteRt, Tensor, type CompiledModel } from "@litertjs/core";
import type { Stroke } from "../data/visitorCards";

const WASM_DIR = "/litert-wasm/";
const MODEL_URL = "/models/sketch-oracle/sketch_oracle_quant.tflite";
const CLASSES_URL = "/models/sketch-oracle/classes.txt";
const INPUT_SIZE = 28;
// Calibrated against Google's official Quick, Draw! numpy_bitmap samples (what
// sketch-oracle was trained on), whose strokes are consistently ~2px wide at
// native 28x28 resolution.
const STROKE_WIDTH_PX = 2;
// Quick Draw drawings were cropped to their bounding box and scaled to fill the
// frame before bitmapping, so the longest side of every sketch spans nearly the
// whole 28px input. Leave a small margin so strokes don't clip at the edges.
const FIT_SIZE_PX = 24;

export type SketchGuess = { label: string; confidence: number };

let modelPromise: Promise<{ model: CompiledModel; classes: string[] }> | null = null;

function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      await loadLiteRt(WASM_DIR);
      const [classesText, model] = await Promise.all([
        fetch(CLASSES_URL).then((res) => res.text()),
        loadAndCompile(MODEL_URL, { accelerator: "wasm" }),
      ]);
      const classes = classesText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      return { model, classes };
    })();
  }
  return modelPromise;
}

/**
 * Rasterizes normalized (0..1) strokes directly at 28x28 — the resolution
 * sketch-oracle was trained on — rather than drawing at display size and
 * downscaling. Downscaling a thin display-resolution line by >10x shrinks it
 * to a sub-pixel width that all but vanishes; drawing straight at 28x28 with
 * a stroke width calibrated to the training data keeps it legible. The
 * drawing is first cropped, scaled and centered by fitToInput.
 * Background=0, stroke≈255, matching Quick Draw's numpy_bitmap format.
 */
/**
 * Maps normalized canvas coordinates into 28x28 input space, cropped to the
 * drawing's bounding box, scaled uniformly (aspect ratio kept) so its longest
 * side spans FIT_SIZE_PX, and centered. Without this, a small sketch drawn in
 * a corner of the canvas reaches the model as a few pixels off to one side —
 * nothing like the frame-filling drawings it was trained on.
 */
function fitToInput(strokes: Stroke[]): (x: number, y: number) => [number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    for (const { x, y } of stroke) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (minX === Infinity) return (x, y) => [x * INPUT_SIZE, y * INPUT_SIZE];

  const extent = Math.max(maxX - minX, maxY - minY);
  // A lone dot has no extent to scale; just center it.
  const scale = extent > 0 ? FIT_SIZE_PX / extent : 1;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return (x, y) => [
    INPUT_SIZE / 2 + (x - centerX) * scale,
    INPUT_SIZE / 2 + (y - centerY) * scale,
  ];
}

function rasterize(strokes: Stroke[]): Uint8Array<ArrayBuffer> {
  const offscreen = document.createElement("canvas");
  offscreen.width = INPUT_SIZE;
  offscreen.height = INPUT_SIZE;
  const ctx = offscreen.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for sketch rasterization");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = STROKE_WIDTH_PX;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const toInput = fitToInput(strokes);
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    if (stroke.length === 1) {
      // A tap with no drag — draw a dot so it still shows up.
      const [x, y] = toInput(stroke[0].x, stroke[0].y);
      ctx.beginPath();
      ctx.arc(x, y, STROKE_WIDTH_PX / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(...toInput(stroke[0].x, stroke[0].y));
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(...toInput(stroke[i].x, stroke[i].y));
    }
    ctx.stroke();
  }

  const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const bitmap = new Uint8Array(INPUT_SIZE * INPUT_SIZE);
  for (let i = 0; i < bitmap.length; i++) {
    bitmap[i] = data[i * 4]; // red channel; strokes are drawn pure white
  }
  return bitmap;
}

/** Classifies a drawing, returning guesses ranked most to least confident. */
export async function classifySketch(strokes: Stroke[], topK = 5): Promise<SketchGuess[]> {
  const { model, classes } = await loadModel();
  const bitmap = rasterize(strokes);

  const input = new Tensor(bitmap, [1, INPUT_SIZE, INPUT_SIZE, 1]);
  let outputs;
  try {
    outputs = await model.run(input);
  } finally {
    input.delete();
  }

  const probs = (await outputs[0].data()) as Float32Array;
  outputs.forEach((tensor) => tensor.delete());

  return Array.from(probs)
    .map((confidence, index) => ({ label: classes[index], confidence }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK);
}

/** Kicks off the WASM runtime + model load without waiting on a guess yet. */
export function warmSketchOracle(): void {
  void loadModel();
}
