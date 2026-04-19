import { supabase } from "@/lib/infra/supabase";
import { fetchAndSave } from "./fetchAndSave";

export const getIntradayOHLC = async (
  symbol: string,
  from: Date,
  to: Date
) => {
  console.log("📥 getIntradayOHLC START:", { symbol, from, to });

  if (!symbol) {
    throw new Error("❌ symbol undefined in getIntradayOHLC");
  }

  const dbSymbol = symbol;

  const fromISO = from.toISOString();
  const toISO = to.toISOString();

  console.log("🕒 RANGE:", { from: fromISO, to: toISO });

  // =========================================
  // ① DB取得
  // =========================================
  let { data } = await supabase
    .from("ohlc_1h")
    .select("*")
    .eq("symbol", dbSymbol)
    .gte("timestamp_utc", fromISO)
    .lte("timestamp_utc", toISO)
    .order("timestamp_utc", { ascending: true });

  console.log("📊 DB rows:", data?.length || 0);

  const latest = data?.[data.length - 1];

  if (latest) {
    console.log("🧭 latest DB:", latest.timestamp_utc);
  }

  // =========================================
  // 🔥 ② 強制fetch（←これが重要）
  // =========================================
  console.log("🔥 FORCE FETCH 1h");

  await fetchAndSave(
    symbol,
    "1h",
    fromISO.slice(0, 10),
    toISO.slice(0, 10)
  );

  console.log("⏳ waiting DB reflect...");

  // =========================================
  // 🔥 ③ DB再取得（確実に取る）
  // =========================================
  let retry = 0;

  while (retry < 5) {
    const res = await supabase
      .from("ohlc_1h")
      .select("*")
      .eq("symbol", dbSymbol)
      .gte("timestamp_utc", fromISO)
      .lte("timestamp_utc", toISO)
      .order("timestamp_utc", { ascending: true });

    console.log(`🔁 retry ${retry}:`, res.data?.length || 0);

    if (res.data?.length) {
      console.log("✅ fetch success:", {
        symbol,
        count: res.data.length,
      });

      data = res.data;
      break;
    }

    await new Promise((r) => setTimeout(r, 500));
    retry++;
  }

  // =========================================
  // ④ fallback
  // =========================================
  if (!data?.length) {
    console.warn("⚠️ fallback: get latest 50 bars");

    const res = await supabase
      .from("ohlc_1h")
      .select("*")
      .eq("symbol", dbSymbol)
      .order("timestamp_utc", { ascending: false })
      .limit(50);

    console.log("📦 fallback rows:", res.data?.length || 0);

    if (res.data?.length) {
      return res.data.reverse();
    }

    console.error("❌ No intraday data:", symbol);
    throw new Error("No intraday data");
  }

  console.log("✅ RETURN rows:", data.length);

  return data;
};