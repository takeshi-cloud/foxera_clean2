import { supabase } from "@/lib/infra/supabase";

type SaveRadarParams = {
  symbol: string;
  type: string;

  x: number;
  y: number;

  timestamp: string;

  price?: number;
  price_timestamp?: string;

  source_daily_date?: string;
  source_week_start?: string;
};

export const saveRadar = async (data: SaveRadarParams) => {
  console.log("🚨 saveRadar called");
  console.log("RADAR DATA:", data);

  // 🔥 正規化
  const normalized = {
    ...data,
    timestamp: new Date(data.timestamp).toISOString(),
    price_timestamp: data.price_timestamp
      ? new Date(data.price_timestamp).toISOString()
      : null,
  };

  console.log("🧹 normalized:", normalized);

  // 🔥 実行
  const { data: result, error } = await supabase
    .from("pivot_radar_history")
    .upsert([normalized], {
      onConflict:
        "symbol,type,source_daily_date,source_week_start",
    })
    .select(); // ← 重要（結果取得）

  if (error) {
    console.error("❌ saveRadar error:", error);
    throw error;
  }

  console.log("✅ saveRadar success:", result);
};