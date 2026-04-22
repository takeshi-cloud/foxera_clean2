// ========================================
// 🔹 PAIRS（監視対象）
// ========================================
export const PAIRS = [
  "USDJPY",
  "GBPJPY",
  "EURJPY",
  "GBPUSD",
  "EURUSD",
  "AUDJPY",
  "AUDUSD",
  "GBPAUD",
  "EURAUD",
  "XAUUSD",
  "NASDAQ",
] as const;


// ========================================
// 🔹 TF（時間足）
// ========================================
export const TIMEFRAMES = [
  "5M",
  "15M",
  "30M",
  "1H",
  "4H",
  "1D",
  "1W",
  "1M",
] as const;


// ========================================
// 🔹 TF TYPE（構造階層）
// ========================================
export const TIMEFRAME_TYPES = [
  "HTF", // 上位構造
  "MTF", // 中期構造
  "LTF", // 下位構造
] as const;


// ========================================
// 🔹 DIRECTION（方向）
// ========================================
export const DIRECTIONS = [
  "long",
  "short",
] as const;


// ========================================
// 🔹 PHASE（状態）
// ========================================
export const PHASES = [
  "Wait",
  "Reversal",
  "Trend",
  "Pullback",
  "Trigger",
] as const;


// ========================================
// 🔹 MODE（システム動作）
// ========================================
export const MODES = [
  "manual", // 手動のみ
  "auto",   // 自動のみ
  "both",   // 両方
] as const;

export type ModeType = typeof MODES[number];


// ========================================
// 🔹 SOURCE（ログの発生元）
// ========================================
export const LOG_SOURCES = [
  "board_action", // カード操作（状態変更）
  "upload",       // スクショ登録
  "system",       // 自動処理
] as const;

export type LogSourceType = typeof LOG_SOURCES[number];


// ========================================
// 🔹 ACTION（ログ内容）
// ========================================
export const ACTIONS = [
  "board_update",
  "create_HTF",
  "create_LTF",
  "move_to_wait",
  "delete_board",
  "upload_screenshots",
  "log_update",
] as const;

export type ActionType = typeof ACTIONS[number];


// ========================================
// 🔹 DEFAULTS（初期値）
// ========================================
export const DEFAULTS = {
  phase: "Wait",
} as const;


// ========================================
// 🔹 SCREENSHOT TYPE（用途）
// ========================================
export const SCREENSHOT_TYPES = [
  "context",   // 環境認識
  "entry",     // エントリー
  "exit",      // 決済
] as const;

export type ScreenshotType =
  typeof SCREENSHOT_TYPES[number];