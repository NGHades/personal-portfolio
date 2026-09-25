import { useScrollReveal } from "../hooks/useScrollReveal";
import AboutMe from "../sections/AboutMe";
import Projects from "../sections/Projects";
import ThingsILearned from "../sections/ThingsILearned";
import VisitorGallery from "../sections/VisitorGallery";
import SendMessage from "../sections/SendMessage";

export default function HomePage() {
  useScrollReveal();

  return (
    <>
      <AboutMe />
      <Projects />
      <ThingsILearned />
      <VisitorGallery />
      <SendMessage />
    </>
  );
}
