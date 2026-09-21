import { PostItForm } from "../components/PostItForm";
import "./SendMessage.css";

export default function SendMessage() {
  return (
    <section id="send-me-a-message" className="page section send-message">
      <h2 className="send-message-heading">Send me a message</h2>
      <p className="send-message-sub">Private — only I'll see it.</p>
      <PostItForm />
    </section>
  );
}
