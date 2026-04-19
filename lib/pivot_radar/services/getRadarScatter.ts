import { supabase } from "@/lib/infra/supabase";

export const getRadarScatter = async () => {
  const { data, error } = await supabase
    .from("pivot_radar_history")
    .select("*");

  if (error) {
    console.error("❌ getRadarScatter error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const map = new Map<string, any>();

  for (const r of data) {
    if (!r.symbol) continue;

    const prev = map.get(r.symbol);

    const t1 = r.timestamp
      ? new Date(r.timestamp).getTime()
      : 0;

    const t2 = prev?.timestamp
      ? new Date(prev.timestamp).getTime()
      : 0;

    if (!prev || t1 > t2) {
      map.set(r.symbol, r);
    }
  }

  return Array.from(map.values()).map((r) => ({
    pair: r.symbol,
    x: r.x,
    y: r.y,
    timestamp: r.timestamp,
  }));
};