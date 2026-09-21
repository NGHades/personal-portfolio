import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { SKETCH_CATEGORIES } from "../data/sketchCategories";
import { FUN_ADJECTIVES } from "../data/funAdjectives";
import type { Point, Stroke } from "../data/visitorCards";
import "./DrawingCanvas.css";

type GuessState =
  | { status: "drawing" }
  | { status: "guessed"; drawingName: string }
  | { status: "submitted"; drawingName: string };

const CANVAS_SIZE = 320;

// TODO: replace with sketch-oracle running client-side via WASM TFLite (docs/adr/0001).
// Currently picks a random category from the real vocabulary to mock a guess.
function mockGuess(): string {
  const noun = SKETCH_CATEGORIES[Math.floor(Math.random() * SKETCH_CATEGORIES.length)];
  const adjective = FUN_ADJECTIVES[Math.floor(Math.random() * FUN_ADJECTIVES.length)];
  return `${adjective} ${noun[0].toUpperCase()}${noun.slice(1)}`;
}

// TODO: send { strokes, drawingName } to the Supabase Edge Function (docs/adr/0002)
// so it lands in the public gallery for everyone, not just this session.
async function submitToGallery(strokes: Stroke[], drawingName: string): Promise<void> {
  console.log("TODO: submit to gallery via Supabase Edge Function", { strokes, drawingName });
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/** Canvas pixels -> the 0..1 space Visitor Cards store, so a card renders at any size. */
function normalize(strokes: Stroke[]): Stroke[] {
  return strokes.map((stroke) => stroke.map(({ x, y }) => ({ x: x / CANVAS_SIZE, y: y / CANVAS_SIZE })));
}

type DrawingCanvasProps = {
  /** Called with the finished drawing once the visitor adds it to the gallery. */
  onSubmit?: (strokes: Stroke[], drawingName: string) => void;
};

export function DrawingCanvas({ onSubmit }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [state, setState] = useState<GuessState>({ status: "drawing" });

  const getContext = () => canvasRef.current?.getContext("2d") ?? null;

  const pointerToCanvasPoint = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (state.status !== "drawing") return;
    drawingRef.current = true;
    const point = pointerToCanvasPoint(e);
    strokesRef.current.push([point]);
    setHasDrawing(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || state.status !== "drawing") return;
    const ctx = getContext();
    const point = pointerToCanvasPoint(e);
    const currentStroke = strokesRef.current[strokesRef.current.length - 1];
    const previous = currentStroke[currentStroke.length - 1];
    currentStroke.push(point);

    if (ctx) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    setHasDrawing(false);
    setState({ status: "drawing" });
  };

  const handleGuess = () => {
    if (!hasDrawing) return;
    setState({ status: "guessed", drawingName: mockGuess() });
  };

  const handleSubmit = async () => {
    if (state.status !== "guessed") return;
    const strokes = normalize(strokesRef.current);
    await submitToGallery(strokes, state.drawingName);
    onSubmit?.(strokes, state.drawingName);
    setState({ status: "submitted", drawingName: state.drawingName });
  };

  return (
    <div className="drawing-canvas-wrap">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="drawing-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className="drawing-canvas-controls">
        {state.status === "drawing" && (
          <>
            <button className="drawing-btn drawing-btn--ghost" onClick={clearCanvas} disabled={!hasDrawing}>
              Clear
            </button>
            <button className="drawing-btn drawing-btn--primary" onClick={handleGuess} disabled={!hasDrawing}>
              Guess it!
            </button>
          </>
        )}

        {state.status === "guessed" && (
          <div className="drawing-result">
            <p className="drawing-result-name">{state.drawingName}</p>
            <div className="drawing-canvas-controls">
              <button className="drawing-btn drawing-btn--ghost" onClick={clearCanvas}>
                Draw again
              </button>
              <button className="drawing-btn drawing-btn--primary" onClick={handleSubmit}>
                Add to gallery
              </button>
            </div>
          </div>
        )}

        {state.status === "submitted" && (
          <div className="drawing-result">
            <p className="drawing-result-name">{state.drawingName} — added to the gallery!</p>
            <button className="drawing-btn drawing-btn--ghost" onClick={clearCanvas}>
              Draw another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
