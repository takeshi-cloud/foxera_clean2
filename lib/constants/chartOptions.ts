// ==============================
// 📊 CHART用（Supabase / API対応）
// ==============================

// 🔹 シンボル（DB/APIと一致させる）
export const CHART_SYMBOLS = [
  { label: "USD/JPY", value: "USD/JPY" },
  { label: "EUR/JPY", value: "EUR/JPY" },
  { label: "GBP/JPY", value: "GBP/JPY" },
  { label: "AUD/JPY", value: "AUD/JPY" },

  { label: "EUR/USD", value: "EUR/USD" },
  { label: "GBP/USD", value: "GBP/USD" },
  { label: "AUD/USD", value: "AUD/USD" },

  { label: "USD/CHF", value: "USD/CHF" },
  { label: "USD/CAD", value: "USD/CAD" },

  // 商品
  { label: "Gold (XAU/USD)", value: "XAU/USD" },
  { label: "Silver (XAG/USD)", value: "XAG/USD" },

  // 指数
  { label: "S&P500", value: "SPX" },
  { label: "NASDAQ", value: "IXIC" },
  { label: "Dow Jones", value: "DJI" },
  { label: "VIX", value: "VIX" },
];


// 🔹 時間足（Supabaseテーブルと一致させる）
export const CHART_TIMEFRAMES = [
  { label: "15分足", value: "15m" },
  { label: "1時間足", value: "1h" },
  { label: "4時間足", value: "4h" },
  { label: "日足", value: "1d" },
];


// 🔹 テーブル名変換（超重要）
export const TF_TO_TABLE: Record<string, string> = {
  "15m": "ohlc_15m",
  "1h": "ohlc_1h",
  "4h": "ohlc_4h",
  "1d": "ohlc_1d",
};