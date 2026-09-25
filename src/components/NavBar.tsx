import { useEffect, useRef, useState } from "react";
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

/** Keep in sync with the max-width media query in NavBar.css. */
const DRAWER_BREAKPOINT = 1070;

export function NavBar() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const spiedId = useActiveSection(SECTION_IDS, pathname);
  // Off the home page none of these sections are on screen, so nothing is current —
  // except Projects while reading a case study, which lives under it.
  const activeId = onHome ? spiedId : pathname.startsWith("/projects/") ? "projects" : null;
  // Only meaningful below the hamburger breakpoint; above it the links sit in the bar.
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  // Dismissing the drawer hands focus back to Menu; following a link doesn't, since
  // the reader has moved on to a section.
  const returnFocusRef = useRef(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissMenu();
    };
    // Widening past the breakpoint hides the drawer, so close it rather than leave
    // the page scroll-locked behind nothing.
    const wide = window.matchMedia(`(min-width: ${DRAWER_BREAKPOINT + 1}px)`);
    const onWide = () => wide.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    // The page underneath stays put while the drawer is open.
    document.documentElement.classList.add("scroll-locked");
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const toggle = toggleRef.current;
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
      document.documentElement.classList.remove("scroll-locked");
      if (returnFocusRef.current) toggle?.focus({ preventScroll: true });
      returnFocusRef.current = false;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  function dismissMenu() {
    returnFocusRef.current = true;
    setMenuOpen(false);
  }

  const renderLinks = (onNavigate?: () => void) => (
    <>
      {LINKS.map((link) => (
        <li key={link.id}>
          <Link
            to={`/#${link.id}`}
            className={`navbar-link${activeId === link.id ? " navbar-link--active" : ""}`}
            aria-current={activeId === link.id ? "true" : undefined}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        </li>
      ))}
      {/* Resume has no section of its own — this downloads the PDF directly.
          TODO: drop the real file at public/resume.pdf; the link works as-is once it's there. */}
      <li>
        <a className="navbar-link" href="/resume.pdf" download onClick={onNavigate}>
          Resume
          <span aria-hidden="true"> ↓</span>
        </a>
      </li>
    </>
  );

  return (
    <>
      <header className="navbar">
        <nav className="navbar-inner" aria-label="Main">
          <Link to="/#about" className="navbar-mark" aria-label="Back to top" onClick={closeMenu}>
            {/* alt="" on purpose: the link already carries the accessible name, so a
                described image would just make screen readers announce it twice. */}
            <img src="/panda-frog.svg" alt="" className="navbar-mark-logo" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="navbar-toggle"
            aria-expanded={menuOpen}
            aria-controls="navbar-drawer"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
          <ul className="navbar-links">{renderLinks()}</ul>
        </nav>
      </header>

      {/* The drawer lives outside the header: the header's backdrop-filter would
          otherwise become the containing block for its position: fixed. */}
      <div
        className={`navbar-backdrop${menuOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={dismissMenu}
      />
      <aside
        ref={drawerRef}
        id="navbar-drawer"
        className={`navbar-drawer${menuOpen ? " is-open" : ""}`}
        aria-label="Menu"
        inert={!menuOpen}
      >
        <button type="button" className="navbar-drawer-close" onClick={dismissMenu}>
          Close
        </button>
        <ul className="navbar-drawer-links">{renderLinks(closeMenu)}</ul>
      </aside>
    </>
  );
}
