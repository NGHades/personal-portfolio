import { TeaseMedia } from "../components/TeaseMedia";
import "./AboutMe.css";

export default function AboutMe() {
  return (
    <section id="about" className="page section about-me">
      <div className="about-me-hero" data-reveal>
        {/* Unlike Upstatement's visually-hidden h1, the name stays readable — it's a
            personal site — just set small above the statement. */}
        <h1 className="about-me-name">Hi, I'm Richie.</h1>
        <p className="about-me-statement">
          I chase pretty things — <span className="italic-accent">sunsets</span> mostly.
        </p>
      </div>

      {/* TODO: two real sunset photos (16:9) — the second fades in on hover. */}
      <div className="tease about-me-photo" data-reveal>
        <TeaseMedia alt="Sunset photo" />
      </div>

      <div className="columns about-me-bio" data-reveal>
        <h2 className="column-label">About</h2>
        <div className="about-me-bio-copy">
          {/* TODO: fill in the rest of the bio */}
          <p>Based in Orange County, CA.</p>
        </div>
      </div>
    </section>
  );
}
