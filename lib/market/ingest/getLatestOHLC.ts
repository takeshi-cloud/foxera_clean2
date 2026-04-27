import { supabase } from "@/lib/infra/supabase";
import {
  TF_TO_TABLE,
} from "@/lib/constants/chartOptions";

export const getLatestOHLC = async (
  symbol: string,
  tf: string,
  start?: string,
  end?: string
) => {
  const table = TF_TO_TABLE[tf];

  if (!table) {
    throw new Error(`Unsupported timeframe: ${tf}`);
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp_utc", { ascending: false }) // 🔥 最新から取る
    .limit(1000); // 🔥 必ず上限つける

  if (error) throw error;

  // 🔥 昇順に戻す（超重要）
  return (data || []).reverse();
};