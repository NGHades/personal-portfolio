import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import AboutMe from "./sections/AboutMe";
import Projects from "./sections/Projects";
import ThingsILearned from "./sections/ThingsILearned";
import VisitorGallery from "./sections/VisitorGallery";
import SendMessage from "./sections/SendMessage";

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <AboutMe />
        <Projects />
        <ThingsILearned />
        <VisitorGallery />
        <SendMessage />
      </main>
      <Footer />
    </>
  );
}
