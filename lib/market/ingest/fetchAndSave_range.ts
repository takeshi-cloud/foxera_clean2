import { fetchOHLC } from "./fetchMarketData";
import { saveMarketData } from "../../market/storage/saveMarketData";
import { MARKETS } from "@/lib/constants/markets";

export async function fetchAndSave_range(
  symbol: string,
  timeframe: string,
  start: string,
  end: string
) {
  console.log("📡 RANGE FETCH:", {
    symbol,
    timeframe,
    start,
    end,
  });

  // =========================================
  // 🔥 symbol → API用に変換
  // =========================================
  const market = MARKETS.find(
    (m) => m.key === symbol || m.label === symbol
  );

  const apiSymbol = market?.api;

  if (!apiSymbol) {
    console.error("❌ Unknown symbol:", symbol);
    throw new Error("Unknown symbol: " + symbol);
  }

  console.log("🔄 API SYMBOL:", apiSymbol);

  // =========================================
  // 🔥 API取得（期間指定）
  // =========================================
  const data = await fetchOHLC(apiSymbol, timeframe, {
    from: start,
    to: end,
    outputsize: 5000,
  });

  if (!data?.length) {
    console.warn("⚠️ no range data");
    return;
  }

  // =========================================
  // 🔥 テーブル決定
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
  // 🔥 フォーマット
  // =========================================
  const formatted = data
    .map((d: any) => {
      if (!d.timestamp_utc) return null;

      const utc = new Date(d.timestamp_utc);
      if (isNaN(utc.getTime())) return null;

      return {
        symbol, // ← DBはkeyのまま（重要）
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

  console.log("💾 SAVE COUNT:", formatted.length);
  console.log(
    "💾 SAVE SAMPLE:",
    formatted[formatted.length - 1]
  );

  // =========================================
  // 🔥 保存
  // =========================================
  try {
    await saveMarketData(table, formatted);
    console.log("✅ RANGE saved:", table, symbol);
  } catch (e) {
    console.error("❌ save failed:", e);
  }
}