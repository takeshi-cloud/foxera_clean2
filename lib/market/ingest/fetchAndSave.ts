import { fetchOHLC } from "./fetchMarketData";
import { saveMarketData } from "../../market/storage/saveMarketData";
import { supabase } from "@/lib/infra/supabase";

export async function fetchAndSave(
  symbol: string,
  timeframe: string,
  from?: string,
  to?: string,
  outputsize: number = 500
) {
  console.log("🚀 START:", {
    symbol,
    timeframe,
    from,
    to,
    outputsize,
  });

  if (!symbol) {
    throw new Error("❌ symbol undefined in fetchAndSave");
  }

  const now = new Date();

  // =========================================
  // ① 無駄fetch防止（5m）
  // =========================================
  if (timeframe === "5m") {
    const { data } = await supabase
      .from("ohlc_5m")
      .select("timestamp_utc")
      .eq("symbol", symbol)
      .order("timestamp_utc", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.timestamp_utc) {
      const last = new Date(data.timestamp_utc);
      const diffMin =
        (now.getTime() - last.getTime()) / 60000;

      if (diffMin >= 0 && diffMin < 3) {
        console.log("⏭ skip fetch (fresh)");
        return;
      }
    }
  }

  // =========================================
  // ② TF変換
  // =========================================
  const intervalMap: Record<string, string> = {
    "5m": "5min",
    "15m": "15min",
  };

  const apiTimeframe =
    intervalMap[timeframe] || timeframe;

  // =========================================
  // ③ 取得範囲
  // =========================================
  let start = from;
  let end = to;

  if (from && to) {
    const startBase = new Date(from);
    const endBase = new Date(to);

    startBase.setDate(startBase.getDate() - 2);

    if (endBase > now) {
      endBase.setTime(now.getTime());
    }

    start = startBase.toISOString().slice(0, 10);
    end = endBase.toISOString().slice(0, 10);
  }

  console.log("📅 fetch range:", start, "→", end);

  // =========================================
  // ④ API取得
  // =========================================
  let data;

  try {
    data = await fetchOHLC(symbol, apiTimeframe, {
      outputsize,
      from: start,
      to: end,
    });
  } catch (e) {
    console.error("❌ fetchOHLC failed:", e);
    return;
  }

  if (!data?.length) {
    console.warn("⚠️ no data fetched:", {
      symbol,
      timeframe,
    });
    return;
  }

  // =========================================
  // ⑤ テーブル
  // =========================================
  const tableMap: Record<string, string> = {
    "5m": "ohlc_5m",
    "15m": "ohlc_15m",
    "1h": "ohlc_1h",
    "4h": "ohlc_4h",
  };

  const table = tableMap[timeframe];

  if (!table) {
    console.error("❌ Unsupported timeframe:", timeframe);
    return;
  }

  // =========================================
  // ⑥ 正規化
  // =========================================
  const formatted = data
    .map((d: any) => {
      if (!d.timestamp_utc) return null;

      const utc = new Date(d.timestamp_utc);
      if (isNaN(utc.getTime())) return null;

      return {
        symbol,
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
        timestamp_utc: utc.toISOString(),
      };
    })
    .filter(Boolean);

  if (!formatted.length) {
    console.warn("❌ no valid rows after format");
    return;
  }

  // =========================================
  // ⑦ 保存
  // =========================================
  try {
    await saveMarketData(table, formatted);
    console.log("✅ saved:", table, symbol);
  } catch (e) {
    console.error("❌ save failed:", symbol, e);
  }
}