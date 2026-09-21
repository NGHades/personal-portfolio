import { ImagePlaceholder } from "../components/ImagePlaceholder";
import { ConfettiCluster } from "../components/ConfettiCluster";
import "./AboutMe.css";

export default function AboutMe() {
  return (
    <section id="about" className="page section about-me">
      <div className="about-me-copy">
        <span className="about-me-dot" aria-hidden="true" />
        <p className="about-me-eyebrow">a bit about who I am...</p>
        <h1 className="about-me-headline">Hi, I'm Richie.</h1>
        <p className="about-me-tagline">
          I chase pretty things — sunsets mostly — whenever I can get away with it.
        </p>
        <p className="about-me-body">
          Based in Orange County, CA. {/* TODO: fill in the rest of the bio */}
        </p>
      </div>

      <div className="about-me-photo-block">
        <p className="about-me-caption italic-accent">it's a pleasure to meet you!</p>
        <ImagePlaceholder label="About Me photo" aspectRatio="4 / 5" className="about-me-photo" />
        <ConfettiCluster className="about-me-confetti" />
      </div>
    </section>
  );
}
