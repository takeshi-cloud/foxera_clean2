// =========================================
// 🔥 マーケット定義（表示 / API / DB完全分離）
// =========================================
export const MARKETS = [
  // =========================================
  // FX
  // =========================================
  { label: "USD/JPY", api: "USD/JPY", key: "USDJPY" },
  { label: "EUR/USD", api: "EUR/USD", key: "EURUSD" },
  { label: "GBP/USD", api: "GBP/USD", key: "GBPUSD" },
  { label: "EUR/JPY", api: "EUR/JPY", key: "EURJPY" },
  { label: "GBP/JPY", api: "GBP/JPY", key: "GBPJPY" },

  { label: "GBP/AUD", api: "GBP/AUD", key: "GBPAUD" },
  { label: "EUR/AUD", api: "EUR/AUD", key: "EURAUD" },

  { label: "XAU/USD", api: "XAU/USD", key: "XAUUSD" },

  { label: "AUD/JPY", api: "AUD/JPY", key: "AUDJPY" },
  { label: "AUD/USD", api: "AUD/USD", key: "AUDUSD" },
  { label: "USD/CHF", api: "USD/CHF", key: "USDCHF" },
  { label: "USD/CAD", api: "USD/CAD", key: "USDCAD" },
  { label: "EUR/GBP", api: "EUR/GBP", key: "EURGBP" },

  // =========================================
  // Commodities
  // =========================================
  //{ label: "XAG/USD", api: "XAG/USD", key: "XAGUSD" },

  // =========================================
  // Bonds
  // =========================================
  //{ label: "US10Y", api: "US10Y:INDEX", key: "US10Y" },
  //{ label: "US02Y", api: "US02Y:INDEX", key: "US02Y" },

  // =========================================
  // Index
  // =========================================
  //{ label: "SPX", api: "SPX:INDEX", key: "SPX" },
  //{ label: "IXIC", api: "IXIC:INDEX", key: "IXIC" },
  //{ label: "DJI", api: "DJI:INDEX", key: "DJI" },
  //{ label: "VIX", api: "VIX:INDEX", key: "VIX" },
];

// =========================================
// MA設定
// =========================================
export const MA_PERIOD = 20;