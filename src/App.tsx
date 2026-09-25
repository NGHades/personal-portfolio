import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import HomePage from "./pages/HomePage";
import CaseStudyPage from "./pages/CaseStudyPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * The router doesn't scroll on its own. A new page starts at the top, like a
 * full page load; a hash link ("/#projects") scrolls to that section instead,
 * using the page's smooth scroll-behavior.
 */
function ScrollManager() {
  // `key` changes on every navigation, even to the same URL, so clicking a section
  // link again after scrolling away still brings you back to it.
  const { pathname, hash, key } = useLocation();
  const lastPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  useEffect(() => {
    // Arriving from another page jumps straight to the section; within the home
    // page it glides there, like the plain anchor links always have.
    const cameFromElsewhere = lastPathname.current !== pathname;
    lastPathname.current = pathname;
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: cameFromElsewhere ? "instant" : "smooth" });
    }
  }, [pathname, hash, key]);

  return null;
}

function Layout() {
  return (
    <>
      <ScrollManager />
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="projects/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
