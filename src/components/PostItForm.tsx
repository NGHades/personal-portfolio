import { useRef, useState, type FormEvent } from "react";
import "./PostItForm.css";

// TODO: wire this up to the Supabase Edge Function that emails Richie (see docs/adr/0002).
async function sendMessage(message: string, contact: string): Promise<void> {
  console.log("TODO: send via Supabase Edge Function", { message, contact });
  await new Promise((resolve) => setTimeout(resolve, 400));
}

type FieldErrors = {
  message?: string;
  contact?: string;
};

export function PostItForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!message.trim()) nextErrors.message = "Write a message first.";
    if (!contact.trim()) nextErrors.contact = "Add your name or email so I can reply.";

    setErrors(nextErrors);
    if (nextErrors.message || nextErrors.contact) {
      // Focus the first field that failed: the error gets announced, and the fix is
      // one keystroke away rather than a hunt back up the note.
      (nextErrors.message ? messageRef : contactRef).current?.focus();
      return;
    }

    setStatus("sending");
    await sendMessage(message.trim(), contact.trim());
    setStatus("sent");
    setMessage("");
    setContact("");
  };

  // noValidate: both fields are checked here instead, so an empty message and an
  // empty contact line fail the same way — as ink on the paper, not as the
  // browser's own validation bubble floating off the side of the note.
  return (
    <form className="postit" onSubmit={handleSubmit} noValidate>
      <textarea
        ref={messageRef}
        className="postit-message"
        placeholder="Write me a message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
        }}
        rows={4}
        aria-invalid={errors.message ? true : undefined}
        aria-describedby={errors.message ? "postit-message-error" : undefined}
        required
      />
      {errors.message && (
        <p className="postit-error" id="postit-message-error" role="alert">
          {errors.message}
        </p>
      )}
      <input
        ref={contactRef}
        className="postit-contact"
        type="text"
        placeholder="Your name / email (so I can reply)"
        value={contact}
        onChange={(e) => {
          setContact(e.target.value);
          if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }));
        }}
        aria-invalid={errors.contact ? true : undefined}
        aria-describedby={errors.contact ? "postit-contact-error" : undefined}
        required
      />
      {errors.contact && (
        <p className="postit-error" id="postit-contact-error" role="alert">
          {errors.contact}
        </p>
      )}
      <div className="postit-footer">
        <button type="submit" className="postit-submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : "Send"}
        </button>
      </div>
      <p className="postit-note">This goes straight to me by email — no one else sees it.</p>
    </form>
  );
}
