import { maBarsBuilder } from "./maBarsBuilder";

import { calcMA } from "../calc/calcMA";
import { sortMAStructure } from "../calc/sortMAStructure";

export async function buildMAStructure(
  pair: string
) {
  console.log(
    "📊 buildMAStructure:",
    pair
  );

  const {
    bars15m,
    bars1h,
    bars4h,
  } = await maBarsBuilder(pair);

  const ma15 =
    calcMA(bars15m);
  const ma1h =
    calcMA(bars1h);
  const ma4h =
    calcMA(bars4h);

  // =========================================
  // 最新価格は15M終値使用
  // realtime fetch禁止
  // =========================================
  const price =
    bars15m[
      bars15m.length - 1
    ].close;

  const structureOrder =
    sortMAStructure({
      price,
      ma15: ma15.now,
      ma1h: ma1h.now,
      ma4h: ma4h.now,
    });

  return {
    pair,
    base_time:
      new Date().toISOString(),

    price,

    ma_now_15: ma15.now,
    ma_prev_15: ma15.prev,

    ma_now_1h: ma1h.now,
    ma_prev_1h: ma1h.prev,

    ma_now_4h: ma4h.now,
    ma_prev_4h: ma4h.prev,

    structure_order:
      structureOrder,

    // =========================================
    // DEBUG INFO
    // =========================================
    debug: {
      bars_used: 20,

      bar_15_now:
        bars15m[
          bars15m.length - 1
        ]?.timestamp_utc,
      bar_15_prev:
        bars15m[
          bars15m.length - 2
        ]?.timestamp_utc,

      bar_1h_now:
        bars1h[
          bars1h.length - 1
        ]?.timestamp_utc,
      bar_1h_prev:
        bars1h[
          bars1h.length - 2
        ]?.timestamp_utc,

      bar_4h_now:
        bars4h[
          bars4h.length - 1
        ]?.timestamp_utc,
      bar_4h_prev:
        bars4h[
          bars4h.length - 2
        ]?.timestamp_utc,

      ma15_source_range: {
        from:
          bars15m[
            bars15m.length - 20
          ]?.timestamp_utc,
        to:
          bars15m[
            bars15m.length - 1
          ]?.timestamp_utc,
      },

      ma1h_source_range: {
        from:
          bars1h[
            bars1h.length - 20
          ]?.timestamp_utc,
        to:
          bars1h[
            bars1h.length - 1
          ]?.timestamp_utc,
      },

      ma4h_source_range: {
        from:
          bars4h[
            bars4h.length - 20
          ]?.timestamp_utc,
        to:
          bars4h[
            bars4h.length - 1
          ]?.timestamp_utc,
      },
    },
  };
}