import { cardsFromDrawings, type DrawingRow, type VisitorCard } from "../data/visitorCards";
import { supabase } from "./supabase";

/** Every visible gallery drawing as a Visitor Card, newest first. Flagged drawings are
 *  filtered out by RLS, and the column list must match the public column grant. */
export async function fetchVisitorCards(): Promise<VisitorCard[]> {
  const { data, error } = await supabase
    .from("drawings")
    .select("id, name, strokes, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return cardsFromDrawings(data as DrawingRow[]);
}
