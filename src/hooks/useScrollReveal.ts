import { useEffect } from "react";

/**
 * Fades each `[data-reveal]` block up into view the first time it scrolls in.
 * The hiding CSS is gated on a class this hook adds, so the page renders fully
 * visible if the script never runs.
 */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    root.classList.add("reveal-ready");

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}
