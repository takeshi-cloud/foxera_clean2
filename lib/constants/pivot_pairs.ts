// ===============================
// 🎯 PIVOT 対象ペア（固定リスト）
// ===============================
export const PAIRS = [
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

];

// ===============================
// 🎯 対応するタイムフレーム
// ===============================
// TwelveData の interval と一致させる
export const PIVOT_TIMEFRAMES = {
  //"4h": "4h",
  daily: "1day",
  weekly: "1week",
  //monthly: "1month",
};

// ===============================
// 🎯 PIVOT の種類（normal / fibo）
// ===============================
export const PIVOT_TYPES = ["normal", "fibo"] as const;

// TypeScript 用の型
export type PivotType = (typeof PIVOT_TYPES)[number];
export type PivotTimeframe = keyof typeof PIVOT_TIMEFRAMES;