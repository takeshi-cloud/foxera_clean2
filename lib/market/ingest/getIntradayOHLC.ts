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

  // =========================================
  // 🔥 ② 必要なときだけfetch
  // =========================================

  let needFetch = false;

  if (!data?.length) {
    console.log("⚠️ NO DATA → fetch");
    needFetch = true;
  } else if (latest) {
    const latestTime = new Date(latest.timestamp_utc);
    const diff = to.getTime() - latestTime.getTime();

    // 👉 1時間以上ズレてたらfetch
    if (diff > 60 * 60 * 1000) {
      console.log("⚠️ DATA OLD → fetch");
      needFetch = true;
    }
  }

  if (needFetch) {
    console.log("🔥 CONDITIONAL FETCH");

    await fetchAndSave(
      symbol,
      "1h",
      fromISO.slice(0, 10),
      toISO.slice(0, 10)
    );

    console.log("⏳ waiting DB reflect...");

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
        data = res.data;
        break;
      }

      await new Promise((r) => setTimeout(r, 500));
      retry++;
    }
  } else {
    console.log("✅ FETCH SKIPPED");
  }

  // =========================================
  // ③ fallback
  // =========================================
  if (!data?.length) {
    console.warn("⚠️ fallback: get latest 50 bars");

    const res = await supabase
      .from("ohlc_1h")
      .select("*")
      .eq("symbol", dbSymbol)
      .order("timestamp_utc", { ascending: false })
      .limit(50);

    if (res.data?.length) {
      return res.data.reverse();
    }

    throw new Error("No intraday data");
  }

  console.log("✅ RETURN rows:", data.length);

  return data;
};