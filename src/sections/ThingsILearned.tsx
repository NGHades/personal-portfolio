import { useEffect, useRef, useState } from "react";
import "./ThingsILearned.css";

type Entry = {
  title: string;
  url?: string;
  note?: string;
  kind?: "video" | "blog" | "book" | "paper";
};

type Week = {
  id: string;
  label: string;
  dates: string;
  entries: Entry[];
};

// Newest week first, so the rail reads left-to-right as "now → back in time". Keep each
// week to roughly 3–6 lines; the cards share a height, so one very long week stretches
// every other card with it.
const WEEKS: Week[] = [
  {
    id: "2026-w03",
    label: "Week 3",
    dates: "Aug 9 – Aug 15",
    entries: [
      {
        title: "Reprieve",
        note: "a temporary delay of a punishment — or a break from any difficult situation",
      },
      {
        title: "Indexical",
        note: "a word whose meaning depends on who says it and when — I, here, now",
      },
      {
        title: "Lighthouse",
        note: "open-source tool for auditing the quality of a web page",
      },
    ],
  },
  {
    id: "2026-w02",
    label: "Week 2",
    dates: "Aug 2 – Aug 8",
    entries: [
      {
        title: "How to actually style my hair",
        url: "https://www.youtube.com/watch?v=cbDUqWVdgaE",
        kind: "video",
      },
      {
        title: "W home workout",
        url: "https://www.youtube.com/watch?v=ho8fvPH_Ro0",
        kind: "video",
      },
    ],
  },
  {
    id: "2026-w01",
    label: "Week 1",
    dates: "Jul 26 – Aug 1",
    entries: [
      {
        title: "Brazil is nearly the size of the US",
        note: "3.3 million square miles against 3.1 — a world map badly undersells it",
      },
      {
        title: "Cognitive debt",
        url: "https://arxiv.org/pdf/2506.08872",
        kind: "paper",
        note: "the real question isn’t whether it exists, but whether anyone is ever made to pay it back",
      },
      {
        title: "Why internet cookies are called cookies",
      },
    ],
  },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ThingsILearned() {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // The arrows are only meaningful while there's somewhere left to scroll, so both
  // the rail's own scrolling and a resize (which can change how many cards fit) have
  // to feed back into their disabled state.
  const syncEdges = () => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1);
  };

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, []);

  // One card per press. The step is measured off the laid-out cards rather than
  // hard-coded, so it stays correct when the card width or gap changes in CSS.
  const scrollByWeek = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const [first, second] = rail.children;
    const step =
      first && second
        ? (second as HTMLElement).offsetLeft - (first as HTMLElement).offsetLeft
        : rail.clientWidth;
    rail.scrollBy({
      left: direction * step,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section id="things-i-learned" className="page section">
      <div className="til-heading-row">
        <h2 className="til-heading">
          Things I <span className="italic-accent">learned.</span>
        </h2>
        <div className="til-rail-nav">
          <button
            type="button"
            className="til-rail-button"
            onClick={() => scrollByWeek(-1)}
            disabled={atStart}
            aria-label="Scroll to more recent weeks"
          >
            ←
          </button>
          <button
            type="button"
            className="til-rail-button"
            onClick={() => scrollByWeek(1)}
            disabled={atEnd}
            aria-label="Scroll to earlier weeks"
          >
            →
          </button>
        </div>
      </div>
      <p className="til-sub">
        A running log of small, mostly non-technical things — one card per week, newest
        first. Scroll sideways to go back in time.
      </p>

      <div
        className="til-rail"
        ref={railRef}
        onScroll={syncEdges}
        tabIndex={0}
        role="region"
        aria-label="Weekly log, scrolls horizontally"
      >
        {WEEKS.map((week) => (
          <article key={week.id} className="til-week" aria-labelledby={`${week.id}-label`}>
            <header className="til-week-header">
              <h3 className="til-week-label" id={`${week.id}-label`}>
                {week.label}
              </h3>
              <p className="til-week-dates">{week.dates}</p>
            </header>
            <ul className="til-entries">
              {week.entries.map((entry, index) => (
                <li key={`${week.id}-${index}`} className="til-entry">
                  {entry.url ? (
                    <a
                      className="til-entry-link"
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {entry.title}
                    </a>
                  ) : (
                    <span className="til-entry-text">{entry.title}</span>
                  )}
                  {entry.kind && <span className="til-entry-kind"> ({entry.kind})</span>}
                  {entry.note && <span className="til-entry-note"> — {entry.note}</span>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
