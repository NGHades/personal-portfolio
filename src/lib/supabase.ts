import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env");
}

/** Publishable-key client: reads go through RLS, writes go through Edge Functions (docs/adr/0002). */
export const supabase = createClient(url, publishableKey);
