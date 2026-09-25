import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently most visible, for scroll-spy nav highlighting.
 * `pageKey` re-finds the sections when it changes — the nav outlives page changes,
 * so the sections it first observed may have unmounted and remounted since.
 */
export function useActiveSection(ids: string[], pageKey?: string): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, pageKey]);

  return activeId;
}
