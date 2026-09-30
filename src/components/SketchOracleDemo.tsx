import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { Point, Stroke } from "../data/visitorCards";
import { classifySketch, warmSketchOracle, type SketchGuess } from "../lib/sketchOracle";
import "./DrawingCanvas.css";
import "./SketchOracleDemo.css";

type DemoState =
  | { status: "empty" }
  | { status: "guessing"; guesses: SketchGuess[] }
  | { status: "guessed"; guesses: SketchGuess[] }
  | { status: "error" };

/** Backing-store size; the canvas is scaled to fit its column with CSS. */
const CANVAS_SIZE = 320;

function formatPercent(confidence: number): string {
  const percent = confidence * 100;
  return percent < 0.1 ? "<0.1%" : `${percent.toFixed(1)}%`;
}

/**
 * The sketch-oracle case study's hero: a canvas that re-guesses after every stroke
 * and shows the model's top five classes with their confidence. Unlike the Visitor
 * Gallery's canvas, nothing is named or submitted.
 */
export function SketchOracleDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  // Guesses resolve out of order when strokes come quickly; only the latest one counts.
  const requestRef = useRef(0);
  const [state, setState] = useState<DemoState>({ status: "empty" });

  useEffect(() => {
    warmSketchOracle();
  }, []);

  // Pointer position in backing-store pixels, since the canvas is drawn smaller than CANVAS_SIZE.
  const toCanvasPoint = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([toCanvasPoint(e)]);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const point = toCanvasPoint(e);
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const previous = stroke[stroke.length - 1];
    stroke.push(point);

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

  const handlePointerUp = async () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const request = ++requestRef.current;
    const strokes = strokesRef.current.map((stroke) =>
      stroke.map(({ x, y }) => ({
        x: Math.min(1, Math.max(0, x / CANVAS_SIZE)),
        y: Math.min(1, Math.max(0, y / CANVAS_SIZE)),
      })),
    );
    setState((prev) => ({ status: "guessing", guesses: "guesses" in prev ? prev.guesses : [] }));
    try {
      const guesses = await classifySketch(strokes, 5);
      if (request === requestRef.current) setState({ status: "guessed", guesses });
    } catch (err) {
      console.error("sketch-oracle inference failed", err);
      if (request === requestRef.current) setState({ status: "error" });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    requestRef.current++;
    setState({ status: "empty" });
  };

  const guesses = "guesses" in state ? state.guesses : [];

  return (
    <div className="oracle-demo">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="drawing-canvas oracle-demo-canvas"
        aria-label="Drawing canvas: draw something and sketch-oracle guesses what it is"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      <div className="oracle-demo-panel">
        <p className="oracle-demo-label">Top 5 guesses</p>

        {state.status === "empty" && <p className="oracle-demo-hint">Draw something and the guesses pop up here.</p>}
        {state.status === "guessing" && guesses.length === 0 && <p className="oracle-demo-hint">Thinking…</p>}
        {state.status === "error" && <p className="oracle-demo-hint">Couldn't guess that one — try again?</p>}

        {guesses.length > 0 && (
          <ol className="oracle-demo-guesses" aria-live="polite">
            {guesses.map((guess, index) => (
              <li
                key={guess.label}
                className="oracle-demo-guess"
                style={{ "--delay": `${index * 60}ms` } as CSSProperties}
              >
                <span className="oracle-demo-guess-label">{guess.label}</span>
                <span className="oracle-demo-guess-percent">{formatPercent(guess.confidence)}</span>
                <span className="oracle-demo-guess-bar" aria-hidden="true">
                  <span style={{ width: `${guess.confidence * 100}%` }} />
                </span>
              </li>
            ))}
          </ol>
        )}

        <button className="drawing-btn drawing-btn--ghost oracle-demo-clear" onClick={clearCanvas} disabled={state.status === "empty"}>
          Clear
        </button>
      </div>
    </div>
  );
}
