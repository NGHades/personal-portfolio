import { useState, type FormEvent } from "react";
import "./PostItForm.css";

// TODO: wire this up to the Supabase Edge Function that emails Richie (see docs/adr/0002).
async function sendMessage(message: string, contact: string): Promise<void> {
  console.log("TODO: send via Supabase Edge Function", { message, contact });
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export function PostItForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    await sendMessage(message.trim(), contact.trim());
    setStatus("sent");
    setMessage("");
    setContact("");
  };

  return (
    <form className="postit" onSubmit={handleSubmit}>
      <textarea
        className="postit-message"
        placeholder="Write me a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        required
      />
      <input
        className="postit-contact"
        type="text"
        placeholder="Your name / email (so I can reply)"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <div className="postit-footer">
        <button type="submit" className="postit-submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : "Send"}
        </button>
      </div>
      <p className="postit-note">This goes straight to me by email — no one else sees it.</p>
    </form>
  );
}
