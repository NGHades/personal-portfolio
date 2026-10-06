// "Send me a message" write path (docs/adr/0002): validates the note, enforces a
// per-visitor cooldown, emails it to Richie via Resend, then records it with the
// admin client since `messages` has no public grants at all.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const COOLDOWN_MS = 60_000;
const MAX_MESSAGE = 5_000;
const MAX_CONTACT = 200;
// Loose on purpose: only decides whether the visitor can be hit with "Reply".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keyed hash of the visitor's IP, so the stored value can't be reversed to an address. */
async function hashVisitor(req: Request): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("IP_HASH_SALT")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Plain-text email, so nothing the visitor typed is ever rendered as HTML. */
async function sendEmail(message: string, contact: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // resend.dev works without a verified domain, but only to the account's own address.
      from: Deno.env.get("MESSAGE_FROM_EMAIL") ?? "Portfolio <onboarding@resend.dev>",
      to: Deno.env.get("MESSAGE_TO_EMAIL"),
      reply_to: EMAIL_PATTERN.test(contact) ? contact : undefined,
      subject: `Portfolio message from ${contact.replace(/\s+/g, " ").slice(0, 80)}`,
      text: `${message}\n\n— ${contact}`,
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return res.ok;
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    for (const name of ["IP_HASH_SALT", "RESEND_API_KEY", "MESSAGE_TO_EMAIL"]) {
      if (!Deno.env.get(name)) {
        console.error(`${name} is not set`);
        return Response.json({ error: "Server misconfigured" }, { status: 500 });
      }
    }

    let body: { message?: unknown; contact?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const contact = typeof body.contact === "string" ? body.contact.trim() : "";
    if (!message || message.length > MAX_MESSAGE) {
      return Response.json(
        { error: `Messages need to be between 1 and ${MAX_MESSAGE} characters.` },
        { status: 400 },
      );
    }
    if (!contact || contact.length > MAX_CONTACT) {
      return Response.json({ error: "Add your name or email so I can reply." }, { status: 400 });
    }

    const submitterHash = await hashVisitor(req);
    const { count, error: countError } = await ctx.supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", submitterHash)
      .gte("created_at", new Date(Date.now() - COOLDOWN_MS).toISOString());
    if (countError) {
      console.error(countError);
      return Response.json({ error: "Could not send message" }, { status: 500 });
    }
    if (count) {
      return Response.json(
        { error: "You just sent a message — try again in a minute." },
        { status: 429 },
      );
    }

    // Email first: a failed send shouldn't leave a row behind that triggers the cooldown.
    if (!(await sendEmail(message, contact))) {
      return Response.json({ error: "Could not send message" }, { status: 502 });
    }

    const { error } = await ctx.supabaseAdmin
      .from("messages")
      .insert({ message, contact, submitter_hash: submitterHash });
    // The email already went out, so the visitor's send succeeded; only the cooldown is lost.
    if (error) console.error(error);

    return Response.json({ ok: true }, { status: 201 });
  }),
};
