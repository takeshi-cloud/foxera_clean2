import { MA_PERIOD } from "@/lib/constants/markets";

type Bar = {
  close: number;
};

export type MAResult = {
  now: number;
  prev: number;
  slope: "up" | "down" | "flat";
};

// =========================================
// MA計算（現在 / 1本前 / 傾き）
// =========================================
export function calcMA(
  bars: Bar[],
  period: number = MA_PERIOD
): MAResult {
  const required = period + 1;

  if (bars.length < required) {
    throw new Error(
      `Not enough bars for MA calculation. Required=${required}, got=${bars.length}`
    );
  }

  const latestBars = bars.slice(-required);

  const prevWindow = latestBars.slice(0, period);
  const nowWindow = latestBars.slice(1);

  const prev =
    prevWindow.reduce(
      (sum, bar) => sum + bar.close,
      0
    ) / period;

  const now =
    nowWindow.reduce(
      (sum, bar) => sum + bar.close,
      0
    ) / period;

  let slope: MAResult["slope"] = "flat";

  if (now > prev) slope = "up";
  else if (now < prev) slope = "down";

  return {
    now,
    prev,
    slope,
  };
}