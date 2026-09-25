import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useActiveSection } from "../hooks/useActiveSection";
import "./NavBar.css";

// Sections of the home page. Links go to "/#id" so they also work from a case study.
const LINKS = [
  { label: "About Me", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Things I Learned", id: "things-i-learned" },
  { label: "Visitor Gallery", id: "visitor-gallery" },
];

// Hoisted: the scroll-spy effect keys off this array, so building it inline would
// hand it a new reference on every render and re-run the observer each time.
const SECTION_IDS = LINKS.map((link) => link.id);

export function NavBar() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const spiedId = useActiveSection(SECTION_IDS, pathname);
  // Off the home page none of these sections are on screen, so nothing is current —
  // except Projects while reading a case study, which lives under it.
  const activeId = onHome ? spiedId : pathname.startsWith("/projects/") ? "projects" : null;
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
        <Link to="/#about" className="navbar-mark" aria-label="Back to top" onClick={closeMenu}>
          {/* alt="" on purpose: the link already carries the accessible name, so a
              described image would just make screen readers announce it twice. */}
          <img src="/panda-frog.svg" alt="" className="navbar-mark-logo" />
        </Link>
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
              <Link
                to={`/#${link.id}`}
                className={`navbar-link${activeId === link.id ? " navbar-link--active" : ""}`}
                aria-current={activeId === link.id ? "true" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
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
