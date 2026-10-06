import { useEffect, useState } from "react";
import "./AboutMe.css";

// Typed, backspaced, then each greeting in turn; the last entry is the one that stays.
const GREETINGS = [
  "Hi",
  "Xin chào",
  "안녕하세요",
  "こんにちは",
  "Hola",
  "Bonjour",
  "你好",
  "Hallo",
  "Hi",
];

const TYPE_MS = 110;
const DELETE_MS = 110;
const HOLD_MS = 900;
const GAP_MS = 250;

export default function AboutMe() {
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    let timer: number;
    let index = 0;
    let length = 0;
    let deleting = false;

    setGreeting("");

    const step = () => {
      const word = Array.from(GREETINGS[index]);
      const isLast = index === GREETINGS.length - 1;

      if (!deleting) {
        length += 1;
        setGreeting(word.slice(0, length).join(""));
        if (length < word.length) {
          timer = window.setTimeout(step, TYPE_MS);
        } else if (isLast) {
          setDone(true);
        } else {
          deleting = true;
          timer = window.setTimeout(step, HOLD_MS);
        }
      } else {
        length -= 1;
        setGreeting(word.slice(0, length).join(""));
        if (length > 0) {
          timer = window.setTimeout(step, DELETE_MS);
        } else {
          deleting = false;
          index += 1;
          timer = window.setTimeout(step, GAP_MS);
        }
      }
    };

    timer = window.setTimeout(step, GAP_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="about" className="page section about-me">
      <div className="about-me-hero" data-reveal>
        {/* Unlike Upstatement's visually-hidden h1, the name stays readable — it's a
            personal site — just set small above the statement. The typed greeting is
            decorative, so assistive tech gets the static English text. */}
        <h1 className="about-me-name" aria-label="Hi, I'm Richie.">
          <span aria-hidden="true">
            <span className="about-me-greeting">{greeting}</span>
            <span
              className={`about-me-caret${done ? " is-done" : ""}`}
            />
            , I'm Richie.
          </span>
        </h1>
        <div className="about-me-bio-copy">
          <p>
            I'm currently a Computer Science student at California State University,
            Fullerton.
          </p>
        </div>
      </div>
    </section>
  );
}
