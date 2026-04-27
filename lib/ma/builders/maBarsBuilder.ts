import { MA_PERIOD } from "@/lib/constants/markets";
import { getLatestOHLC } from "@/lib/market/ingest/getLatestOHLC";
import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";
import { build4HBars_NY } from "../transform/build4HBars_NY";

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
// 共通：土日除外
// =========================================
const removeWeekend = (bars: any[]) =>
  bars.filter((b) => {
    const day = new Date(b.timestamp_utc).getUTCDay();
    return day !== 0 && day !== 6;
  });

// =========================================
// 共通：確定足
// =========================================
const getLastClosedTime = (tf: string) => {
  const now = new Date();

  const msMap: Record<string, number> = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
  };

  const tfMs = msMap[tf];

  return new Date(
    Math.floor(now.getTime() / tfMs) * tfMs
  );
};

// =========================================
// 共通：確定足までカット
// =========================================
const cutToClosed = (bars: any[], tf: string) => {
  const baseTime = getLastClosedTime(tf).getTime();

  return bars.filter(
    (b) =>
      new Date(b.timestamp_utc).getTime() <= baseTime
  );
};

// =========================================
// 共通：stale判定
// =========================================
const isStale = (bars: any[], hours: number) => {
  if (!bars.length) return true;

  const last = bars[bars.length - 1]?.timestamp_utc;
  if (!last) return true;

  const lastTime = new Date(last).getTime();
  const threshold =
    Date.now() - hours * 60 * 60 * 1000;

  return lastTime < threshold;
};

// =========================================
// MA計算用Bars取得（完全ログ版）
// =========================================
export async function maBarsBuilder(pair: string) {
  console.log("\n========================");
  console.log("🚀 START MA BUILDER:", pair);
  console.log("========================");

  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 35);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const required = MA_PERIOD + 1;

  // =============================
  // FETCH
  // =============================
  let bars15m = await getLatestOHLC(
    pair,
    "15m",
    startStr,
    endStr
  );

  let bars1h = await getLatestOHLC(
    pair,
    "1h",
    startStr,
    endStr
  );

  // =============================
  // SORT ONLY（これだけ残す）
  // =============================
  bars15m = sortAsc(bars15m);
  bars1h = sortAsc(bars1h);

  // =============================
  // 🔥 最新確認（ここが一番重要）
  // =============================
  console.log("🧠 LATEST", {
    pair,
    last15:
      bars15m[bars15m.length - 1],
    last1h:
      bars1h[bars1h.length - 1],
  });

  // =============================
  // 🔥 検証ログ
  // =============================
  console.log(
    "🔥 LAST 10 15M",
    bars15m.slice(-10)
  );

  console.log(
    "🔥 LAST 10 1H",
    bars1h.slice(-10)
  );

  // =============================
  // 4H
  // =============================
  let bars4h = build4HBars_NY(
    bars1h
  );

  bars4h = sortAsc(bars4h);

  console.log("📊 4H LAST", {
    last4h:
      bars4h[bars4h.length - 1],
  });

  // =============================
  // FINAL
  // =============================
  console.log("✅ FINAL", {
    pair,
    last15:
      bars15m[
        bars15m.length - 1
      ]?.timestamp_utc,
    last1h:
      bars1h[
        bars1h.length - 1
      ]?.timestamp_utc,
    last4h:
      bars4h[
        bars4h.length - 1
      ]?.timestamp_utc,
  });

  if (bars15m.length < required)
    throw new Error("15M不足");

  if (bars1h.length < required)
    throw new Error("1H不足");

  if (bars4h.length < required)
    throw new Error("4H不足");

  return {
    bars15m,
    bars1h,
    bars4h,
  };
}