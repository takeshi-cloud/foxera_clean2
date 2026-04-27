import { maBarsBuilder } from "./maBarsBuilder";
import { calcMA } from "../calc/calcMA";
import { sortMAStructure } from "../calc/sortMAStructure";
import { MA_PERIOD } from "@/lib/constants/markets";

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

  // =========================================
  // 🔥 最新N本だけ使用（最重要）
  // =========================================
  const window15 = bars15m.slice(
    -(MA_PERIOD + 1)
  );
  const window1h = bars1h.slice(
    -(MA_PERIOD + 1)
  );
  const window4h = bars4h.slice(
    -(MA_PERIOD + 1)
  );

  // =========================================
  // MA計算
  // =========================================
  const ma15 = calcMA(window15);
  const ma1h = calcMA(window1h);
  const ma4h = calcMA(window4h);

  // =========================================
  // 最新価格（windowベース）
  // =========================================
  const price =
    window15[
      window15.length - 1
    ]?.close;

    console.log("PRICE RAW", {
  pair,
  price,
  lastBar:
    window15[
      window15.length - 1
    ],
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
    // DEBUG INFO（window基準に統一）
    // =========================================
    debug: {
      bars_used: MA_PERIOD,

      bar_15_now:
        window15[
          window15.length - 1
        ]?.timestamp_utc,
      bar_15_prev:
        window15[
          window15.length - 2
        ]?.timestamp_utc,

      bar_1h_now:
        window1h[
          window1h.length - 1
        ]?.timestamp_utc,
      bar_1h_prev:
        window1h[
          window1h.length - 2
        ]?.timestamp_utc,

      bar_4h_now:
        window4h[
          window4h.length - 1
        ]?.timestamp_utc,
      bar_4h_prev:
        window4h[
          window4h.length - 2
        ]?.timestamp_utc,

      ma15_source_range: {
        from:
          window15[0]?.timestamp_utc,
        to:
          window15[
            window15.length - 1
          ]?.timestamp_utc,
      },

      ma1h_source_range: {
        from:
          window1h[0]?.timestamp_utc,
        to:
          window1h[
            window1h.length - 1
          ]?.timestamp_utc,
      },

      ma4h_source_range: {
        from:
          window4h[0]?.timestamp_utc,
        to:
          window4h[
            window4h.length - 1
          ]?.timestamp_utc,
      },
    },
  };
}