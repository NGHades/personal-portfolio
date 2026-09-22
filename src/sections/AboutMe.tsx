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
    </section>
  );
}
