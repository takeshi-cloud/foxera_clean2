// ===============================
// 🎯 PIVOT 対象ペア（TwelveData 形式）
// ===============================
export const PIVOT_PAIRS = [
  "USD/JPY",
  "EUR/JPY",
  "GBP/JPY",
  "AUD/JPY",
  "AUD/USD",
  "GBP/AUD",
  "EUR/AUD",
  "EUR/USD",
  "GBP/USD",
  "XAU/USD",
  //"^N225",
  //"DJI",
  //"US10Y",
  //"US02Y",
  //"DXY",
] as const;

// ===============================
// 🎯 対応するタイムフレーム
// ===============================
export const PIVOT_TIMEFRAMES = {
  //"4h": "4h",
  "daily": "1day",
  "weekly": "1week",
  //"monthly": "1month",
} as const;

// ===============================
// 🎯 PIVOT の種類
// ===============================
//export const PIVOT_TYPES = ["normal", "fibo"] as const;
export const PIVOT_TYPES = ["normal"] as const;
// ===============================
// 🎯 TypeScript 型
// ===============================
export type PivotPair = (typeof PIVOT_PAIRS)[number];
export type PivotType = (typeof PIVOT_TYPES)[number];
export type PivotTimeframe = keyof typeof PIVOT_TIMEFRAMES;