import { supabase } from "@/lib/infra/supabase";
import { fetchOHLC } from "./fetchMarketData";

export const getOrFetchPrice = async (symbol: string) => {
  console.log("🚀 getOrFetchPrice:", symbol);

  if (!symbol) {
    throw new Error("❌ symbol undefined");
  }

  // =========================================
  // ① 最新1本取得
  // =========================================
  const rows = await fetchOHLC(symbol, "5m", {
    outputsize: 1,
  });

  if (!rows?.length) {
    throw new Error("❌ No price data");
  }

  const r = rows[0];

  const timestamp = new Date(r.timestamp_utc);

  if (isNaN(timestamp.getTime())) {
    throw new Error("❌ invalid timestamp");
  }

  const row = {
    symbol,
    open: Number(r.open),
    high: Number(r.high),
    low: Number(r.low),
    close: Number(r.close),
    timestamp_utc: timestamp.toISOString(),
  };

  console.log("📥 upsert row:", row);

  // =========================================
  // ② 保存（🔥結果も必ず取得）
  // =========================================
  const { data, error } = await supabase
    .from("ohlc_5m")
    .upsert([row], {
      onConflict: "symbol,timestamp_utc",
    })
    .select();

  if (error) {
    console.error("❌ upsert error:", error);
    throw error;
  }

  console.log("💾 DB result:", data);

  if (!data || data.length === 0) {
    console.warn("⚠️ upsert succeeded but no rows returned");
  }

  // =========================================
  // ③ 返却
  // =========================================
  const price = Number(row.close);

  if (isNaN(price)) {
    throw new Error("❌ Invalid price");
  }

  console.log("💰 PRICE:", price);
  console.log("🔥 RETURN PRICE");

  return {
    price,
    timestamp: row.timestamp_utc,
  };
};