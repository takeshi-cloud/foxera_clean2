import { supabase } from "@/lib/infra/supabase";

export const getRadarHistory = async (market: string) => {
  // 🔥 内部統一
  const symbol = market;

  const { data, error } = await supabase
    .from("pivot_radar_history")
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("❌ getRadarHistory error:", error);
    throw error;
  }

  console.log("📡 radarHistory rows:", data?.length);

  return data ?? [];
};