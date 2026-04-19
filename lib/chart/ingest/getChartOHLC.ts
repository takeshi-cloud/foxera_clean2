import { supabase } from "@/lib/infra/supabase";
import {
  TF_TO_TABLE,
} from "@/lib/constants/chartOptions";

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

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("symbol", symbol) // 🔥 ここ修正
    .gte("timestamp_utc", start)
    .lte("timestamp_utc", `${end}T23:59:59`)
    .order("timestamp_utc", { ascending: true });

  if (error) throw error;

  return data || [];
};