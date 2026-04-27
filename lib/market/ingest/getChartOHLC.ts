import { supabase } from "@/lib/infra/supabase";
import { TF_TO_TABLE } from "@/lib/constants/chartOptions";

export const getChartOHLC = async (
  symbol: string,
  tf: string,
  start: string,
  end: string
) => {
  const table = TF_TO_TABLE[tf];

  if (!table) {
    throw new Error(`Unsupported timeframe: ${tf}`);
  }

  if (!start || !end) {
    throw new Error("getChartOHLC requires start and end");
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("symbol", symbol)
    .gte("timestamp_utc", start)
    .lte("timestamp_utc", `${end}T23:59:59`)
    .order("timestamp_utc", { ascending: true });

  if (error) {
    console.error("❌ getChartOHLC error:", error);
    throw error;
  }

  // 🔍 デバッグ（必要ならON）
  console.log("📊 getChartOHLC", {
    symbol,
    tf,
    start,
    end,
    count: data?.length,
    first: data?.[0]?.timestamp_utc,
    last: data?.[data.length - 1]?.timestamp_utc,
  });

  return data || [];
};