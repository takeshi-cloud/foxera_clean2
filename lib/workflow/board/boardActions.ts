// =========================================
// 🧠 commands（完全ログ駆動版）
// =========================================

import { createLog } from "../core/logEngine";


// ================================================
// 🔴 WAIT移動
// ================================================
export const moveToWaitCommand = async (item: any) => {
  await createLog(
    {
      user_id: item.user_id,
      pair: item.pair,
      timeframe_type: item.timeframe_type,
      direction: item.direction,
      phase: "Wait",
      image_url: item.image_url,
      action: "move_to_wait",
    },
    "board_action" // 🔥追加
  );
};

// ================================================
// 🔵 LONG → SHORT
// ================================================
export const createShortCommand = async (item: any) => {
  await createLog(
    {
      user_id: item.user_id,
      pair: item.pair,
      timeframe_type: "short",
      direction: item.direction,
      phase: "Trend",
      image_url: item.image_url,
      action: "delete_board",
    },
    "board_action" // 🔥追加
  );
};

// ================================================
// 🟢 方向切替
// ================================================
export const toggleDirectionCommand = async (item: any) => {
  const newDir = item.direction === "long" ? "short" : "long";

  await createLog(
    {
      user_id: item.user_id,
      pair: item.pair,
      timeframe_type: item.timeframe_type,
      direction: newDir,
      phase: item.phase,
      image_url: item.image_url,
      action: "board_update",
    },
    "board_action" // 🔥追加
  );
};