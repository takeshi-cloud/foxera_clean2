import { supabase } from "@/lib/infra/supabase";
import { fetchAndSave } from "./fetchAndSave";

export const getDailyOHLC = async (
  symbol: string,
  date: string
) => {
  console.log("📅 getDailyOHLC:", symbol, date);

  // =========================================
  // 日付チェック
  // =========================================
  if (!date || typeof date !== "string") {
    throw new Error("Invalid date input");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date format: " + date);
  }

  const start = new Date(date + "T00:00:00.000Z");

  if (isNaN(start.getTime())) {
    throw new Error("Invalid date parse: " + date);
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const dbSymbol = symbol;

  // =========================================
  // DB取得
  // =========================================
  let { data } = await supabase
    .from("ohlc_1d")
    .select("*")
    .eq("symbol", dbSymbol) // 🔥統一
    .gte("timestamp_utc", start.toISOString())
    .lt("timestamp_utc", end.toISOString())
    .order("timestamp_utc", { ascending: false })
    .limit(1);

  if (data?.length) return data[0];

  // =========================================
  // API取得
  // =========================================
  console.log("🔄 fetch daily:", symbol, date);

  await fetchAndSave(symbol, "1day", date, date);

  const { data: newData } = await supabase
    .from("ohlc_1d")
    .select("*")
    .eq("symbol", dbSymbol) // 🔥統一
    .gte("timestamp_utc", start.toISOString())
    .lt("timestamp_utc", end.toISOString())
    .order("timestamp_utc", { ascending: false })
    .limit(1);

  if (!newData?.length) {
    throw new Error("No daily OHLC");
  }

  return newData[0];
};