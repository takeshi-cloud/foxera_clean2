import { MA_PERIOD } from "@/lib/constants/markets";
import { getChartOHLC } from "@/lib/chart/ingest/getChartOHLC";
import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";

import { build4HBars_NY } from "../transform/build4HBars_NY";

// =========================================
// MA計算用Bars取得
// 15M / 1H / 4H
// =========================================
export async function maBarsBuilder(
  pair: string
) {
  const end = new Date();
  const start = new Date();

  start.setUTCDate(
    start.getUTCDate() - 35
  );

  const startStr = start
    .toISOString()
    .slice(0, 10);

  const endStr = end
    .toISOString()
    .slice(0, 10);

  const required = MA_PERIOD + 1;

  // 15M
  let bars15m =
    await getChartOHLC(
      pair,
      "15m",
      startStr,
      endStr
    );

  if (bars15m.length < required) {
    await fetchAndSave(
      pair,
      "15m",
      startStr,
      endStr
    );

    await new Promise((r) =>
      setTimeout(r, 500)
    );

    bars15m =
      await getChartOHLC(
        pair,
        "15m",
        startStr,
        endStr
      );
  }

  // 1H
  let bars1h =
    await getChartOHLC(
      pair,
      "1h",
      startStr,
      endStr
    );

  if (bars1h.length < required) {
    await fetchAndSave(
      pair,
      "1h",
      startStr,
      endStr
    );

    await new Promise((r) =>
      setTimeout(r, 500)
    );

    bars1h =
      await getChartOHLC(
        pair,
        "1h",
        startStr,
        endStr
      );
  }

  // =========================================
  // DEBUG
  // =========================================
  console.log("🔍 bars1h DEBUG", {
    pair,
    isArray: Array.isArray(bars1h),
    type: typeof bars1h,
    length: bars1h?.length,
    first: bars1h?.[0],
  });

  const bars4h =
    build4HBars_NY(bars1h);

  console.log("📊 MA BAR COUNT", {
    pair,
    required,
    bars15m: bars15m.length,
    bars1h: bars1h.length,
    bars4h: bars4h.length,
  });

  if (bars15m.length < required) {
    throw new Error(
      `Not enough 15M bars: ${bars15m.length}/${required}`
    );
  }

  if (bars1h.length < required) {
    throw new Error(
      `Not enough 1H bars: ${bars1h.length}/${required}`
    );
  }

  if (bars4h.length < required) {
    throw new Error(
      `Not enough 4H bars: ${bars4h.length}/${required}`
    );
  }

  return {
    bars15m,
    bars1h,
    bars4h,
  };
}