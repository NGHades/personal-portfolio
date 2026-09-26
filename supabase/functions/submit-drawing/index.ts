// Visitor Gallery write path (docs/adr/0002): validates a drawing, enforces a
// per-visitor cooldown, then inserts with the admin client since `drawings`
// has no insert policy.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const COOLDOWN_MS = 60_000;
const MAX_STROKES = 200;
const MAX_POINTS = 5_000;
// "Generous Zebra", "Sleepy Alarm clock" — adjective + sketch-oracle label.
const NAME_PATTERN = /^[A-Z][a-z]+ [A-Z][a-z]+(?: [a-z]+)?$/;

type Point = { x: number; y: number };
type Stroke = Point[];

function isPoint(value: unknown): value is Point {
  if (typeof value !== "object" || value === null) return false;
  const { x, y } = value as Record<string, unknown>;
  // Strokes arrive normalized to the 0..1 canvas space.
  return typeof x === "number" && typeof y === "number" &&
    x >= 0 && x <= 1 && y >= 0 && y <= 1;
}

function isStrokes(value: unknown): value is Stroke[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_STROKES) return false;
  let points = 0;
  for (const stroke of value) {
    if (!Array.isArray(stroke) || stroke.length === 0) return false;
    points += stroke.length;
    if (points > MAX_POINTS || !stroke.every(isPoint)) return false;
  }
  return true;
}

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

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    if (!Deno.env.get("IP_HASH_SALT")) {
      console.error("IP_HASH_SALT is not set");
      return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    let body: { name?: unknown; strokes?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { name, strokes } = body;
    if (typeof name !== "string" || name.length > 40 || !NAME_PATTERN.test(name)) {
      return Response.json({ error: "Invalid drawing name" }, { status: 400 });
    }
    if (!isStrokes(strokes)) {
      return Response.json({ error: "Invalid strokes" }, { status: 400 });
    }

    const submitterHash = await hashVisitor(req);
    const { count, error: countError } = await ctx.supabaseAdmin
      .from("drawings")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", submitterHash)
      .gte("created_at", new Date(Date.now() - COOLDOWN_MS).toISOString());
    if (countError) {
      console.error(countError);
      return Response.json({ error: "Could not submit drawing" }, { status: 500 });
    }
    if (count) {
      return Response.json(
        { error: "You just submitted a drawing — try again in a minute." },
        { status: 429 },
      );
    }

    const { data, error } = await ctx.supabaseAdmin
      .from("drawings")
      .insert({ name, strokes, submitter_hash: submitterHash })
      .select("id, name, created_at")
      .single();
    if (error) {
      console.error(error);
      return Response.json({ error: "Could not submit drawing" }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  }),
};
