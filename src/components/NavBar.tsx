import { useEffect, useState } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import "./NavBar.css";

const LINKS = [
  { href: "#about", label: "About Me", id: "about" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#things-i-learned", label: "Things I Learned", id: "things-i-learned" },
  { href: "#visitor-gallery", label: "Visitor Gallery", id: "visitor-gallery" },
];

// Hoisted: the scroll-spy effect keys off this array, so building it inline would
// hand it a new reference on every render and re-run the observer each time.
const SECTION_IDS = LINKS.map((link) => link.id);

export function NavBar() {
  const activeId = useActiveSection(SECTION_IDS);
  // Only meaningful below the hamburger breakpoint; above it the list is always shown.
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar${menuOpen ? " navbar--open" : ""}`}>
      <nav className="navbar-inner">
        <a href="#about" className="navbar-mark" aria-label="Back to top" onClick={closeMenu}>
          {/* alt="" on purpose: the link already carries the accessible name, so a
              described image would just make screen readers announce it twice. */}
          <img src="/panda-frog.svg" alt="" className="navbar-mark-logo" />
        </a>
        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <ul className="navbar-links" id="navbar-links">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                className={`navbar-link${activeId === link.id ? " navbar-link--active" : ""}`}
                aria-current={activeId === link.id ? "true" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            </li>
          ))}
          {/* Resume has no section of its own — this downloads the PDF directly.
              TODO: drop the real file at public/resume.pdf; the link works as-is once it's there. */}
          <li>
            <a className="navbar-link" href="/resume.pdf" download onClick={closeMenu}>
              Resume
              <span aria-hidden="true"> ↓</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
