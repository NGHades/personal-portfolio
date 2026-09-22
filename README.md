# personal-portfolio

## Visitor Gallery — sketch-oracle CNN pipeline

Wiring the real `sketch-oracle` CNN into the Visitor Gallery's "Guess it!" step,
replacing the `mockGuess()` placeholder in `DrawingCanvas.tsx`. Per
[ADR 0001](docs/adr/0001-client-side-sketch-oracle-inference.md), inference runs
entirely client-side via a WASM TFLite/LiteRT runtime — no server-side model
hosting. Source model lives in the sibling `~/Projects/sketch-oracle` repo.

- [x] Locate the trained model artifacts (`sketch_oracle_quant.tflite`,
      `classes.txt`) and confirm the exact preprocessing the FastAPI server /
      reference frontend use, so browser-side preprocessing matches training
      (28×28 grayscale, uint8, background=0/stroke=255, no client-side
      normalization — the model's own `Rescaling` layer handles that).
- [x] Pick a browser inference runtime. Using `@litertjs/core` (LiteRT Web,
      Google's actively-maintained successor to `tfjs-tflite`) — it matches
      ADR 0001's "WASM TFLite/LiteRT runtime" wording directly.
- [x] Copy `sketch_oracle_quant.tflite` and `classes.txt` into this repo as
      static assets (`public/models/sketch-oracle/`).
- [x] Add `@litertjs/core` as a dependency and vendor its WASM runtime files
      as static assets (`public/litert-wasm/`) so inference works without a
      CDN dependency.
- [x] Write a `sketchOracle` inference module (`src/lib/sketchOracle.ts`):
      loads the WASM runtime once, compiles the model once (lazy, cached),
      rasterizes the drawing canvas to a 28×28 uint8 bitmap matching the
      training format, and returns ranked `{ label, confidence }` guesses.
- [x] Wire `DrawingCanvas.tsx`'s "Guess it!" button to the real classifier
      instead of `mockGuess()`; added a `"guessing"` loading state and an
      `"error"` state for a graceful WASM/inference failure fallback.
- [x] Remove the now-dead mock plumbing (`mockGuess`,
      `src/data/sketchCategories.ts`) and point the Drawing Name's noun
      vocabulary at the shipped `classes.txt`.
- [x] Type-check / build (`tsc -b && vite build`) and confirm the model +
      WASM assets are bundled correctly — verified `dist/models/sketch-oracle/`
      and `dist/litert-wasm/` are present in the build output.
- [x] Fixed a real bug found during manual verification: LiteRT Web's input
      compatibility check rejects a concrete-shape input tensor against a
      model whose input has a dynamic batch dim (`UInt8[1,28,28,1]` vs.
      expected `UInt8[-1,28,28,1]`) — the Python TFLite interpreter tolerates
      this, LiteRT Web doesn't, and there's no JS-side workaround (no
      resize/reshape API in `@litertjs/core` 2.5.3). Patched the shipped
      `.tflite` by stripping each tensor's `shape_signature` field (flatc +
      the upstream `schema.fbs`), leaving only the already-concrete `shape`.
      **`public/models/sketch-oracle/sketch_oracle_quant.tflite` is therefore
      not byte-identical to `~/Projects/sketch-oracle/models/`'s copy** — if
      the model is retrained/reconverted, this patch needs reapplying (or
      fixed upstream by exporting with a fixed `batch_size=1` Keras `Input`).
- [ ] Manually verify in-browser (`npm run dev`): draw a few known shapes
      (star, cat, house) and confirm sensible guesses, confirm first-load
      latency is acceptable, confirm it still works after a hard refresh
      (WASM/model caching). **Needs a human in an actual browser** — not
      something this pass could verify itself.
- [ ] Update `docs/adr/0001-client-side-sketch-oracle-inference.md` /
      `CONTEXT.md` if any detail (runtime choice, asset locations) drifts from
      what's documented there.

Out of scope for this pass (separate pipeline, see ADR 0002): submitting
drawings to the public gallery and the flag/report action still go through a
not-yet-built Supabase Edge Function — those stay mocked.
