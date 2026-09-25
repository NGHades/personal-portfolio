import { PostItForm } from "../components/PostItForm";
import "./SendMessage.css";

export default function SendMessage() {
  return (
    <section id="send-me-a-message" className="page section send-message">
      <h2 className="section-heading send-message-heading" data-reveal>
        Send me a <span className="italic-accent">message</span>
      </h2>
      <p className="send-message-sub" data-reveal>
        Private — only I'll see it.
      </p>
      <div data-reveal>
        <PostItForm />
      </div>
    </section>
  );
}
