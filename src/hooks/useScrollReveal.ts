import { useEffect } from "react";

/** Blocks that scroll in together enter one after another, this far apart. */
const STAGGER_MS = 80;

/**
 * Fades each `[data-reveal]` block up into view the first time it scrolls in,
 * using Upstatement's ScrollReveal settings (see upstatement-design.md § Motion).
 * The hiding CSS is gated on a class this hook adds, so the page renders fully
 * visible if the script never runs. Call it once per page, from the page component,
 * so it picks up that page's blocks.
 */
export function useScrollReveal() {
  useEffect(() => {
    // Like Upstatement's `mobile: false`: on touch screens, content just appears.
    const skip = window.matchMedia("(prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)");
    if (skip.matches) return;

    const root = document.documentElement;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)");

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement);
        entering.forEach((el, i) => {
          el.style.transitionDelay = `${i * STAGGER_MS}ms`;
          el.classList.add("is-revealed");
          observer.unobserve(el);
        });
      },
      // Upstatement's viewOffset: a block starts revealing 100px above the bottom edge.
      { rootMargin: "0px 0px -100px 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    root.classList.add("reveal-ready");

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}
