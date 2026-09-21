# Run sketch-oracle inference client-side instead of a hosted backend

The Visitor Gallery needs a noun guess from `sketch-oracle` for every drawing. It already exists as a Python/TensorFlow model served via a FastAPI wrapper, but the site's chosen backend (Supabase) only runs Deno/TypeScript Edge Functions — there's no native Python runtime to drop that service into. We decided to run the model directly in the browser instead, using the already-quantized `sketch_oracle_quant.tflite` artifact (164KB) via a WASM TFLite/LiteRT runtime, rather than standing up a separate Python host for it.

This keeps the site's whole footprint at "static frontend + Supabase" instead of adding a third always-on service just to serve occasional, low-traffic inference requests, and needs no conversion work since the model is already in a browser-runnable format.

## Considered Options

- **Host the existing FastAPI service** on Cloud Run / Render / Fly.io and call it from the client. Rejected: adds a service to operate, monitor, and potentially pay for, disproportionate to a personal portfolio's traffic and a model well within browser-inference budget.

## Consequences

- Retraining or growing `sketch-oracle` requires re-exporting/re-quantizing to `.tflite`; if the model ever grows past what's reasonable to ship as a static browser asset, this decision needs revisiting.
- The noun vocabulary the Visitor Gallery can guess is whatever `classes.txt` defines at export time — extending it means shipping a new model file, not a server deploy.
