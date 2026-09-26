import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DrawingCanvas } from "../components/DrawingCanvas";
import type { VisitorCardSceneHandle } from "../components/VisitorCardScene";
import { MOCK_VISITOR_CARDS, type VisitorCard } from "../data/visitorCards";
import { fetchVisitorCards } from "../lib/visitorGallery";
import "./VisitorGallery.css";

// three.js is the heaviest dependency on the site and this is the only section
// that needs it, so it loads after first paint rather than blocking it.
const VisitorCardScene = lazy(() =>
  import("../components/VisitorCardScene").then((m) => ({ default: m.VisitorCardScene })),
);

const RECENT_NAME_COUNT = 5;

export default function VisitorGallery() {
  // Real submissions from Supabase, newest first. The mock cards follow them so the
  // gallery never looks empty.
  const [visitorCards, setVisitorCards] = useState<VisitorCard[]>([]);
  const sceneRef = useRef<VisitorCardSceneHandle>(null);

  const loadVisitorCards = useCallback(() => {
    fetchVisitorCards()
      .then(setVisitorCards)
      .catch((err) => console.error("couldn't load the visitor gallery", err));
  }, []);

  useEffect(loadVisitorCards, [loadVisitorCards]);

  // Refetch rather than append locally, so the new card gets its real id and number.
  const handleSubmit = loadVisitorCards;

  const handleReport = useCallback((card: VisitorCard) => {
    // TODO: wire up to the flag/report Edge Function (docs/adr/0002).
    console.log("TODO: report card via Supabase Edge Function", card.id);
  }, []);

  // Memoized: the scene re-lays out its cards whenever this array changes identity.
  const cards = useMemo(() => [...visitorCards, ...MOCK_VISITOR_CARDS], [visitorCards]);

  const recentCards = [
    ...visitorCards,
    ...[...MOCK_VISITOR_CARDS].sort((a, b) => b.visitorNumber - a.visitorNumber),
  ].slice(0, RECENT_NAME_COUNT);

  return (
    <section id="visitor-gallery" className="page section visitor-gallery">
      <div className="visitor-gallery-intro" data-reveal>
        <h2 className="section-heading">Visitor Gallery</h2>
        <p className="visitor-gallery-sub">
          Draw something. A CNN I built (<code>sketch-oracle</code>) will guess what it is, and pair it
          with a random adjective to name your creation.
        </p>
      </div>

      <div data-reveal>
        <DrawingCanvas onSubmit={handleSubmit} />
      </div>

      <div className="visitor-gallery-browse" data-reveal>
        <div className="columns visitor-gallery-recent">
          <h3 className="column-label">Recently drawn</h3>
          {/* Hovering one name dims the rest; clicking pulls that card forward below. */}
          <ul className="visitor-gallery-names">
            {recentCards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className="visitor-gallery-name"
                  onClick={() => sceneRef.current?.select(card.id)}
                >
                  {card.drawingName}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Suspense fallback={<div className="visitor-gallery-scene-fallback">Loading the gallery…</div>}>
          <VisitorCardScene ref={sceneRef} cards={cards} onReport={handleReport} />
        </Suspense>
      </div>
    </section>
  );
}
