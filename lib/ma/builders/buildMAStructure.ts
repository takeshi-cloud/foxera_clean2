import { maBarsBuilder } from "./maBarsBuilder";
import { calcMA } from "../calc/calcMA";
import { sortMAStructure } from "../calc/sortMAStructure";
import { MA_PERIOD } from "@/lib/constants/markets";

export async function buildMAStructure(
  pair: string,
  inputDate: Date
) {
  console.log("\n========================");
  console.log("📊 buildMAStructure:", pair);
  console.log("========================");

  const {
    bars15m,
    bars1h,
    bars4h,
  } = await maBarsBuilder(pair, inputDate);

  // =========================================
  // 🔥 MAに使うウィンドウ
  // =========================================
  const window15 = bars15m.slice(-(MA_PERIOD + 1));
  const window1h = bars1h.slice(-(MA_PERIOD + 1));
  const window4h = bars4h.slice(-(MA_PERIOD + 1));

  // =========================================
  // 🔥 使用データログ（最重要）
  // =========================================
  console.log("📊 MA SOURCE 15m",
    window15.map(b => ({
      time: b.timestamp_utc,
      close: b.close,
    }))
  );

  console.log("📊 MA SOURCE 1h",
    window1h.map(b => ({
      time: b.timestamp_utc,
      close: b.close,
    }))
  );

  console.log("📊 MA SOURCE 4h",
    window4h.map(b => ({
      time: b.timestamp_utc,
      close: b.close,
    }))
  );

  // =========================================
  // MA計算
  // =========================================
  const ma15 = calcMA(window15);
  const ma1h = calcMA(window1h);
  const ma4h = calcMA(window4h);

  // =========================================
  // 最新価格
  // =========================================
  const lastBar = window15[window15.length - 1];
  const price = lastBar?.close;

  console.log("💰 PRICE", {
    pair,
    time: lastBar?.timestamp_utc,
    price,
  });

  // =========================================
  // structure
  // =========================================
  const structureOrder =
    sortMAStructure({
      price,
      ma15: ma15.now,
      ma1h: ma1h.now,
      ma4h: ma4h.now,
    });

  // =========================================
  // FINAL SUMMARY（重要）
  // =========================================
  console.log("✅ MA RESULT", {
    pair,
    ma15_now: ma15.now,
    ma1h_now: ma1h.now,
    ma4h_now: ma4h.now,
    structure: structureOrder,
  });

  return {
    pair,
    base_time: new Date().toISOString(),

    price,

    ma_now_15: ma15.now,
    ma_prev_15: ma15.prev,

    ma_now_1h: ma1h.now,
    ma_prev_1h: ma1h.prev,

    ma_now_4h: ma4h.now,
    ma_prev_4h: ma4h.prev,

    structure_order: structureOrder,

    // =========================================
    // DEBUG（軽量版）
    // =========================================
    debug: {
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
    },
  };
}