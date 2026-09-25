import "./AboutMe.css";

export default function AboutMe() {
  return (
    <section id="about" className="page section about-me">
      <div className="about-me-hero" data-reveal>
        {/* Unlike Upstatement's visually-hidden h1, the name stays readable — it's a
            personal site — just set small above the statement. */}
        <h1 className="about-me-name">Hi, I'm Richie.</h1>
      </div>
      <div className="about-me-bio-copy">
        <p>
          I'm currently a Computer Science student at California State University, 
          Fullerton.
        </p>
      </div>
      {/* <div className="columns about-me-bio" data-reveal>
      </div> */}
    </section>
  );
}
