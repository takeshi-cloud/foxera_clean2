// lib/market/ingest/getBarsWithFetch.ts

import { getLatestOHLC } from "./getLatestOHLC";
import { fetchAndSave } from "./fetchAndSave";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";
import { supabase } from "@/lib/infra/supabase";

// =========================================
// 共通：昇順ソート
// =========================================
const sortAsc = (bars: any[]) =>
  [...bars].sort(
    (a, b) =>
      new Date(a.timestamp_utc).getTime() -
      new Date(b.timestamp_utc).getTime()
  );

// =========================================
// 本体
// =========================================
export async function getBarsWithFetch(
  pair: string,
  tf: "15m" | "1h",
  baseTime: Date,
  required: number
) {
  console.log("\n========================");
  console.log("📦 getBarsWithFetch START", {
    pair,
    tf,
    required,
  });

  // =========================================
  // baseTime
  // =========================================
  

  console.log("🕒 BASE TIME", {
    tf,
    base: baseTime.toISOString(),
  });

 // =========================================
// DB取得（baseTime基準に変更）
// =========================================

const extra = 250;

const start = new Date(baseTime);

if (tf === "15m") {
  start.setMinutes(start.getMinutes() - extra * 15);
} else if (tf === "1h") {
  start.setHours(start.getHours() - extra);
}

const table = tf === "15m" ? "ohlc_15m" : "ohlc_1h";

const { data } = await supabase
  .from(table)
  .select("*")
  .eq("symbol", pair)
  .gte("timestamp_utc", start.toISOString())
  .lte("timestamp_utc", baseTime.toISOString())
  .order("timestamp_utc", { ascending: true });

let bars = data || [];

  // =========================================
  // baseTimeでカット
  // =========================================
  bars = bars.filter(
    (b) =>
      new Date(b.timestamp_utc) <= baseTime
  );

  console.log("✂️ AFTER BASE CUT", {
    count: bars.length,
    last: bars[bars.length - 1]?.timestamp_utc,
  });


// =========================================
// 🔥 最新時間チェック（これ追加）
// =========================================
const lastBarTime = new Date(
  bars[bars.length - 1]?.timestamp_utc
).getTime();

const baseTimeMs = baseTime.getTime();

// どれくらいズレてるか
const diffHours =
  (baseTimeMs - lastBarTime) / (1000 * 60 * 60);

console.log("⏱ TIME GAP CHECK", {
  last: bars[bars.length - 1]?.timestamp_utc,
  base: baseTime.toISOString(),
  diffHours,
});





  // =========================================
  // 本数チェック
  // =========================================
 const isTimeMissing = lastBarTime < baseTimeMs;

if (bars.length < required || isTimeMissing) {
  console.log("⚠️ FETCH TRIGGER", {
    reason: {
      notEnoughBars: bars.length < required,
      timeMissing: isTimeMissing,
    },
  });
    // =========================================
    // fetch（不足分補完）
    // =========================================
    const from = new Date(baseTime);
    from.setUTCDate(from.getUTCDate() - 5); // 仮：余裕期間

    const fromStr =
  from.toISOString();

const toStr =
  baseTime.toISOString();

    console.log("🌐 FETCH RANGE", {
      from: fromStr,
      to: toStr,
    });

    await fetchAndSave(pair, tf, fromStr, toStr);

    // =========================================
    // 再取得
    // =========================================
    bars = await getLatestOHLC(pair, tf);
    bars = sortAsc(bars);

    bars = bars.filter(
  (b) =>
    new Date(b.timestamp_utc) <= baseTime
);

// 👇ここに追加（この位置固定）
const last = bars[bars.length - 1];

console.log("🔍 DEBUG TIME CHECK", {
  last_raw: last?.timestamp_utc,
  last_ms: new Date(last?.timestamp_utc).getTime(),

  base_raw: baseTime.toISOString(),
  base_ms: baseTime.getTime(),

  diff_hours:
    (baseTime.getTime() -
      new Date(last?.timestamp_utc).getTime()) /
    (1000 * 60 * 60),
});
  }

  // =========================================
  // 必要本数だけ
  // =========================================
  const result = bars.slice(-required);

  console.log("✅ FINAL BARS", {
    required,
    actual: result.length,
    from: result[0]?.timestamp_utc,
    to: result[result.length - 1]?.timestamp_utc,
  });

  return result;
}