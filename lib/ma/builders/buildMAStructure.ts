import { maBarsBuilder } from "./maBarsBuilder";
import { calcMA } from "../calc/calcMA";
import { sortMAStructure } from "../calc/sortMAStructure";
import { MA_PERIOD } from "@/lib/constants/markets";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";
import { analyzeMASignal } from "../calc/analyzeMASignal";

export async function buildMAStructure(
  pair: string,
  inputDate: Date
) {
  console.log("\n========================");
  console.log("📊 buildMAStructure:", pair);
  console.log("========================");

  // =========================================
  // baseTime
  // =========================================
  const base15 = getBaseTime_MA(inputDate, "15m");
  const base1h = getBaseTime_MA(inputDate, "1h");
  const base4h = getBaseTime_MA(inputDate, "4h");

  console.log("🕒 BASE TIMES", {
    base15: base15.toISOString(),
    base1h: base1h.toISOString(),
    base4h: base4h.toISOString(),
  });

  const { bars15m, bars1h, bars4h } =
    await maBarsBuilder(pair, inputDate);

  console.log("📦 BAR COUNT (ALL)", {
    bars15m: bars15m.length,
    bars1h: bars1h.length,
    bars4h: bars4h.length,
  });

  const removeSpike = (bars: any[], threshold = 0.03) =>
  bars.filter((b, i) => {
    if (i === 0) return true;

    const prev = bars[i - 1].close;
    const diff = Math.abs(b.close - prev) / prev;

    return diff < threshold;
  });

const bars15m_cleaned = removeSpike(bars15m);
const bars1h_cleaned = removeSpike(bars1h);
const bars4h_cleaned = removeSpike(bars4h);

const removeWeekend = (bars: any[]) =>
  bars.filter((b) => {
    const d = new Date(b.timestamp_utc).getUTCDay();
    return d !== 0 && d !== 6;
  });

const bars15m_clean = removeWeekend(bars15m_cleaned);
const bars1h_clean = removeWeekend(bars1h_cleaned);
const bars4h_clean = removeWeekend(bars4h_cleaned);

console.log("🧪 WEEKEND FILTER", {
  "15m_before": bars15m.length,
  "15m_after": bars15m_clean.length,

  "1h_before": bars1h.length,
  "1h_after": bars1h_clean.length,

  "4h_before": bars4h.length,
  "4h_after": bars4h_clean.length,
});
  // =========================================
// 最低本数チェック（MA用）
// =========================================
const MINIMUM = MA_PERIOD + 1;

if (bars15m_clean.length < MINIMUM)
  throw new Error("❌ 15m不足（clean後）");

if (bars1h_clean.length < MINIMUM)
  throw new Error("❌ 1h不足（clean後）");

if (bars4h_clean.length < MINIMUM)
  throw new Error("❌ 4h不足（clean後）");

  // =========================================
  // MA用ウィンドウ
  // =========================================
  const window15 = bars15m_clean.slice(-(MA_PERIOD + 1));
const window1h = bars1h_clean.slice(-(MA_PERIOD + 1));
const window4h = bars4h_clean.slice(-(MA_PERIOD + 1));

console.log("🧪 MA INPUT COUNT", {
  "15m": window15.length,
  "1h": window1h.length,
  "4h": window4h.length,
});

  // =========================================
  // 使用データログ
  // =========================================
  console.log("📊 USED BARS 15m", {
    count: window15.length,
    data: window15.map((b) => ({
      time: b.timestamp_utc,
      close: b.close,
    })),
  });

  console.log("📊 USED BARS 1h", {
    count: window1h.length,
    data: window1h.map((b) => ({
      time: b.timestamp_utc,
      close: b.close,
    })),
  });

  console.log("📊 USED BARS 4h", {
    count: window4h.length,
    data: window4h.map((b) => ({
      time: b.timestamp_utc,
      close: b.close,
    })),
  });

  // =========================================
  // MA計算
  // =========================================
  const ma15 = calcMA(window15);
  const ma1h = calcMA(window1h);
  const ma4h = calcMA(window4h);

  // =========================================
  // 価格
  // =========================================
  const lastBar = window15.at(-1);
  const price = lastBar?.close;

  console.log("💰 PRICE", {
    pair,
    time: lastBar?.timestamp_utc,
    price,
  });

  // =========================================
  // structure
  // =========================================
  const structureOrder = sortMAStructure({
    price,
    ma15: ma15.now,
    ma1h: ma1h.now,
    ma4h: ma4h.now,
  });

const signal = analyzeMASignal({
  price,
  ma15: ma15.now,

  ma1h_now: ma1h.now,
  ma1h_prev: ma1h.prev,

  ma4h_now: ma4h.now,
  ma4h_prev: ma4h.prev,

  structure_order: structureOrder,
});

  console.log("✅ MA RESULT", {
    pair,
    ma15_now: ma15.now,
    ma1h_now: ma1h.now,
ma1h_prev: ma1h.prev,

ma4h_now: ma4h.now,
ma4h_prev: ma4h.prev,
    structure: structureOrder,
  });

  // =========================================
  // DEBUG（コンソールのみ）
  // =========================================
  console.log("🧪 MA DEBUG", {
    bars_used: MA_PERIOD,
    bar_15_now: window15.at(-1)?.timestamp_utc,
    bar_1h_now: window1h.at(-1)?.timestamp_utc,
    bar_4h_now: window4h.at(-1)?.timestamp_utc,
    range_15m: {
      from: window15[0]?.timestamp_utc,
      to: window15.at(-1)?.timestamp_utc,
    },
    range_1h: {
      from: window1h[0]?.timestamp_utc,
      to: window1h.at(-1)?.timestamp_utc,
    },
    range_4h: {
      from: window4h[0]?.timestamp_utc,
      to: window4h.at(-1)?.timestamp_utc,
    },
  });




  // =========================================
  // RETURN（DB用）
  // =========================================
  return {
    pair,
    base_15m: base15.toISOString(),
    base_1h: base1h.toISOString(),
    base_4h: base4h.toISOString(),
    base_time: base4h.toISOString(),

    price,

    ma_now_15: ma15.now,
    ma_prev_15: ma15.prev,

    ma_now_1h: ma1h.now,
    ma_prev_1h: ma1h.prev,

    ma_now_4h: ma4h.now,
    ma_prev_4h: ma4h.prev,

    structure_order: structureOrder,
     direction: signal.direction,
  phase: signal.phase,
  stars: signal.stars,
  };
}