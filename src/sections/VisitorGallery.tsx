import { Suspense, lazy, useCallback, useState } from "react";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { MOCK_VISITOR_CARDS, issueVisitorCard, type Stroke, type VisitorCard } from "../data/visitorCards";
import "./VisitorGallery.css";

// three.js is the heaviest dependency on the site and this is the only section
// that needs it, so it loads after first paint rather than blocking it.
const VisitorCardScene = lazy(() =>
  import("../components/VisitorCardScene").then((m) => ({ default: m.VisitorCardScene })),
);

export default function VisitorGallery() {
  // TODO: seed from Supabase instead of the mock set once reads are wired up (docs/adr/0002).
  const [cards, setCards] = useState<VisitorCard[]>(MOCK_VISITOR_CARDS);

  const handleSubmit = useCallback((strokes: Stroke[], drawingName: string) => {
    setCards((current) => [...current, issueVisitorCard(current, strokes, drawingName)]);
  }, []);

  const handleReport = useCallback((card: VisitorCard) => {
    // TODO: wire up to the flag/report Edge Function (docs/adr/0002).
    console.log("TODO: report card via Supabase Edge Function", card.id);
  }, []);

  return (
    <section id="visitor-gallery" className="page section visitor-gallery">
      <div className="visitor-gallery-intro">
        <h2 className="visitor-gallery-heading">Visitor Gallery</h2>
        <p className="visitor-gallery-sub">
          Draw something. A CNN I built (<code>sketch-oracle</code>) will guess what it is, and pair it
          with a random adjective to name your creation.
        </p>
      </div>

      <DrawingCanvas onSubmit={handleSubmit} />

      <div className="visitor-gallery-browse">
        <h3 className="visitor-gallery-browse-heading">Browse the gallery</h3>
        <Suspense fallback={<div className="visitor-gallery-scene-fallback">Loading the gallery…</div>}>
          <VisitorCardScene cards={cards} onReport={handleReport} />
        </Suspense>
      </div>
    </section>
  );
}
