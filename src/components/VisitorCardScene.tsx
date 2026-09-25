import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { FaFlag, FaXmark } from "react-icons/fa6";
import type { VisitorCard } from "../data/visitorCards";
import { createVisitorCardCanvas, formatIssuedOn, formatVisitorNumber } from "./visitorCardFace";
import { VisitorCardGallery } from "./visitorCardGallery";
import "./VisitorCardScene.css";

type VisitorCardSceneProps = {
  cards: VisitorCard[];
  onReport: (card: VisitorCard) => void;
};

/** Lets something outside the canvas (the Drawing Names list) pull a card forward. */
export type VisitorCardSceneHandle = {
  select: (id: string) => void;
};

/**
 * Shown when WebGL isn't available. The card art is the same painter the 3D
 * scene textures its planes with, so the gallery degrades to a flat grid of the
 * exact same cards rather than disappearing.
 */
function VisitorCardFallback({ cards, onReport }: VisitorCardSceneProps) {
  const images = useMemo(
    () => cards.map((card) => ({ card, src: createVisitorCardCanvas(card).toDataURL() })),
    [cards],
  );

  return (
    <ul className="visitor-card-fallback">
      {images.map(({ card, src }) => (
        <li key={card.id}>
          <img src={src} alt={`${formatVisitorNumber(card.visitorNumber)} — ${card.drawingName}, issued on ${formatIssuedOn(card.issuedOn)}`} />
          <button type="button" onClick={() => onReport(card)}>
            <FaFlag size={11} aria-hidden="true" /> Report
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Thin React shell around the three.js gallery: it owns the canvas element and
 * mirrors the scene's selection into state so the details bar can render in DOM,
 * where it stays focusable and readable. All motion lives in VisitorCardGallery.
 */
export function VisitorCardScene({
  cards,
  onReport,
  ref,
}: VisitorCardSceneProps & { ref?: Ref<VisitorCardSceneHandle> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<VisitorCardGallery | null>(null);

  // No-op in the WebGL fallback, where every card is already laid out flat.
  useImperativeHandle(ref, () => ({ select: (id) => galleryRef.current?.select(id) }), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  // Purely presentational — the report itself is the parent's business.
  const [reportedIds, setReportedIds] = useState<ReadonlySet<string>>(() => new Set());

  const report = (card: VisitorCard) => {
    onReport(card);
    setReportedIds((current) => new Set(current).add(card.id));
  };

  useEffect(() => {
    const container = containerRef.current;
    const host = canvasHostRef.current;
    if (!container || !host) return;

    // A fresh canvas per mount: a disposed renderer's context sticks to its
    // canvas, so reusing one across remounts hands three a dead context.
    const canvas = document.createElement("canvas");
    canvas.className = "visitor-card-canvas";
    host.append(canvas);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let gallery: VisitorCardGallery;
    try {
      gallery = new VisitorCardGallery({
        canvas,
        onSelect: setSelectedId,
        reducedMotion: motionQuery.matches,
      });
    } catch {
      canvas.remove();
      setWebglFailed(true);
      return;
    }
    galleryRef.current = gallery;
    gallery.resize(container.clientWidth, container.clientHeight);

    const onMotionChange = () => gallery.setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener("change", onMotionChange);

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      gallery.resize(width, height);
    });
    resizeObserver.observe(container);

    // Don't burn frames on a scene nobody is looking at — this is one section of
    // a long single-page scroll.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => gallery.setActive(entry.isIntersecting),
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      gallery.dispose();
      canvas.remove();
      galleryRef.current = null;
    };
  }, []);

  useEffect(() => {
    galleryRef.current?.setCards(cards);
  }, [cards]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") galleryRef.current?.select(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const selected = cards.find((card) => card.id === selectedId) ?? null;

  if (webglFailed) {
    return (
      <div className="visitor-card-scene">
        <VisitorCardFallback cards={cards} onReport={report} />
      </div>
    );
  }

  return (
    <div className="visitor-card-scene">
      <div className="visitor-card-stage" ref={containerRef}>
        <div ref={canvasHostRef} className="visitor-card-canvas-host" aria-hidden="true" />

        {selected && (
          <div className="visitor-card-details" role="group" aria-label={`${selected.drawingName} card actions`}>
            <span className="visitor-card-details-number">{formatVisitorNumber(selected.visitorNumber)}</span>
            <span className="visitor-card-details-name">{selected.drawingName}</span>
            <span className="visitor-card-details-date">Issued on {formatIssuedOn(selected.issuedOn)}</span>
            <button
              type="button"
              className="visitor-card-details-btn"
              onClick={() => report(selected)}
              disabled={reportedIds.has(selected.id)}
              title="Report this card"
            >
              <FaFlag size={11} aria-hidden="true" />
              {reportedIds.has(selected.id) ? "Reported" : "Report"}
            </button>
            <button
              type="button"
              className="visitor-card-details-btn visitor-card-details-btn--close"
              onClick={() => galleryRef.current?.select(null)}
              aria-label="Close card"
            >
              <FaXmark size={13} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <p className="visitor-card-hint">Drag the cards around — click one to pull it forward.</p>

      {/* The canvas can't be read by assistive tech, so the same entries are
          listed here in text. Each Report button drives the identical action. */}
      <ul className="visitor-card-index">
        {cards.map((card) => (
          <li key={card.id} className="visitor-card-index-item">
            <span>
              {formatVisitorNumber(card.visitorNumber)} — {card.drawingName}, issued on{" "}
              {formatIssuedOn(card.issuedOn)}
            </span>
            <button type="button" onClick={() => report(card)} disabled={reportedIds.has(card.id)}>
              Report {card.drawingName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
