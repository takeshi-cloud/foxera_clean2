import { supabase } from "@/lib/infra/supabase";

export async function getLatestMAStructures() {
  const { data, error } =
    await supabase
      .from("ma_structure_history")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  const latestMap = new Map();

  for (const row of data) {
    if (!latestMap.has(row.pair)) {
      latestMap.set(row.pair, row);
    }
  }

  return Array.from(
    latestMap.values()
  );
}