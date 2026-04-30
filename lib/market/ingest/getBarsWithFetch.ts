// lib/market/ingest/getBarsWithFetch.ts

import { getLatestOHLC } from "./getLatestOHLC";
import { fetchAndSave } from "./fetchAndSave";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";

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
  inputDate: Date,
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
  const baseTime = getBaseTime_MA(inputDate, tf);

  console.log("🕒 BASE TIME", {
    tf,
    base: baseTime.toISOString(),
  });

  // =========================================
  // DB取得
  // =========================================
  let bars = await getLatestOHLC(pair, tf);

  bars = sortAsc(bars);

  console.log("📦 DB FETCH", {
    count: bars.length,
    first: bars[0]?.timestamp_utc,
    last: bars[bars.length - 1]?.timestamp_utc,
  });

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

    const fromStr = from.toISOString().slice(0, 10);
    const toStr = baseTime.toISOString().slice(0, 10);

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

    console.log("🔄 AFTER FETCH", {
      count: bars.length,
      last: bars[bars.length - 1]?.timestamp_utc,
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