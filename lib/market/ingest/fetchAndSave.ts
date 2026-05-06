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

// 🔥 TwelveData検証結果
// request end を +10h 広げる検証
// save時 -10h は現状維持

if (from && to) {

  const startBase = new Date(from);
  const endBase = new Date(to);

  // =====================================
  // 🔥 既存仕様
  // Weekly / Daily境界不足対策
  // =====================================

  startBase.setDate(
    startBase.getDate() - 2
  );

  // =====================================
  // 🔥 request
  // =====================================

  const apiStart = new Date(startBase);

  const apiEnd = new Date(endBase);

  // 🔥 ENDだけ +10h
  apiEnd.setTime(
    apiEnd.getTime() +
    10 * 60 * 60 * 1000
  );

  start = apiStart.toISOString();
  end = apiEnd.toISOString();
}

console.log("📅 fetch mode:", {
  type: "latest",
  outputsize,
});

console.log("📡 FETCH REQUEST", {
  requestedFrom: from,
  requestedTo: to,
  adjustedFrom: start,
  adjustedTo: end,
});

// =========================================
// 🔥 REQUEST LOG
// =========================================

console.log("📡 FETCH REQUEST", {
  symbol,
  timeframe,

  requestedFrom: from,
  requestedTo: to,

  actualRequestFrom: start,
  actualRequestTo: end,

  note:
    "request=UTC 그대로 / response timestamp is +10h world",
});

// =========================================
// ④ API取得
// =========================================

let data;

try {

  data = await fetchOHLC(symbol, apiTimeframe, {
    from: start,
    to: end,
    outputsize,
  });

  // =====================================
  // 🔥 RESULT LOG
  // =====================================

  console.log("🔥 FETCH COUNT:", data?.length);

  console.log("🔥 FETCH FIRST:", data?.[0]);

  console.log(
    "🔥 FETCH LAST:",
    data?.[data.length - 1]
  );

  console.log("📡 FETCH RANGE", {
    first: data?.[0]?.timestamp_utc,
    last: data?.[data.length - 1]?.timestamp_utc,
    count: data?.length,
  });

  // =====================================
  // 🔥 REQUEST vs RESPONSE
  // =====================================

  console.log("📡 REQUEST vs RESULT", {

    // request
    requestedFrom: start,
    requestedTo: end,

    // response
    responseFirst:
      data?.[0]?.timestamp_utc,

    responseLast:
      data?.[data.length - 1]?.timestamp_utc,

    note:
      "response timestamps are expected to be +10h shifted",
  });

} catch (e) {

  console.error("❌ fetchOHLC failed:", e);

  return;
}

// =========================================
// no data
// =========================================

if (!data?.length) {

  console.warn("⚠️ no data fetched:", {
    symbol,
    timeframe,
    start,
    end,
  });

  return;
}

/// =========================================
// 🔥 異常値補正（完全版）
// =========================================
const normalizeBars = (rows) => {
  const result = [];

  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i];
    if (!cur) continue;

    const open = Number(cur.open);
    const high = Number(cur.high);
    const low = Number(cur.low);
    const close = Number(cur.close);

    // =========================
    // 最初の1本
    // =========================
    if (result.length === 0) {
      // 異常ならスキップ
      if (
        open <= 0 ||
        high <= 0 ||
        low <= 0 ||
        close <= 0 ||
        high < low
      ) {
        console.warn("⚠️ skip first invalid", cur.timestamp_utc);
        continue;
      }

      result.push({
        ...cur,
        open,
        high,
        low,
        close,
      });
      continue;
    }

    // =========================
    // 通常判定
    // =========================
    const prev = result[result.length - 1];
    const prevClose = Number(prev.close);

    const isInvalid =
      open <= 0 ||
      high <= 0 ||
      low <= 0 ||
      close <= 0 ||
      high < low ||
      close > high ||
      close < low ||
      Math.abs(close - prevClose) / prevClose > 0.2;

    if (isInvalid) {
      console.warn("⚠️ 補正", cur.timestamp_utc);

      result.push({
        ...cur,
        open: prevClose,
        high: prevClose,
        low: prevClose,
        close: prevClose,
      });
      continue;
    }

    result.push({
      ...cur,
      open,
      high,
      low,
      close,
    });
  }

  return result;
};

// ★ここだけ（重要）
data = normalizeBars(data);



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
 const OFFSET_MS = -10 * 60 * 60 * 1000;

const formatted = data
  .map((d: any) => {
    if (!d.timestamp_utc) return null;

    const raw = new Date(d.timestamp_utc);
    if (isNaN(raw.getTime())) return null;

    const corrected = new Date(raw.getTime() + OFFSET_MS);

    return {
      symbol,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),

      // 🔥 追加
      timestamp_raw: raw.toISOString(),

      // 🔥 ここを差し替え
      timestamp_utc: corrected.toISOString(),
    };
  })
  .filter(Boolean);

  if (!formatted.length) {
    console.warn("❌ no valid rows after format");
    return;
  }
console.log("💾 SAVE COUNT:", formatted.length);
console.log("💾 SAVE LAST:", formatted[formatted.length - 1]);
  // =========================================
  // ⑦ 保存
  // =========================================
  try {
    await saveMarketData(table, formatted);
    console.log("✅ saved:", table, symbol);
  } catch (e) {
    console.error("❌ save failed:", symbol, e);
  }

  console.log("🔥 FETCH LAST:", data[data.length - 1]);
console.log("💾 SAVE LAST:", formatted[formatted.length - 1]);
}


