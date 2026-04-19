// app/home/lib/homeActions.ts

import {
  moveToWaitCommand,
  createShortCommand,
  toggleDirectionCommand,
  removeBoardCommand,
} from "@/lib/workflow/commands";

import { createLog } from "@/lib/workflow/core/logEngine";

import {
  PHASES,
  DIRECTIONS,
  TIMEFRAME_TYPES,
  ACTIONS,
} from "@/lib/constants/LogOptions";

// =========================================
// 🧠 共通実行（command → load）
// =========================================
const run = async (fn: () => Promise<void>, load: () => Promise<void>) => {
  await fn();
  await load();
};

// =========================================
// 🔁 基本操作
// =========================================

// 方向切替
export const handleToggleDirection = async (
  item: any,
  load: () => Promise<void>
) => {
  await run(() => toggleDirectionCommand(item), load);
};

// 削除
export const handleRemove = async (
  item: any,
  load: () => Promise<void>
) => {
  await run(() => removeBoardCommand(item), load);
};

// WAITへ移動
export const handleMoveToWait = async (
  item: any,
  load: () => Promise<void>
) => {
  await run(() => moveToWaitCommand(item), load);
};

// =========================================
// 🟦 SHORT作成
// =========================================
export const handleCreateShort = async (
  item: any,
  load: () => Promise<void>,
  boards: any[]
) => {
  await createShortCommand(item);
  await load();
};

// =========================================
// 🔁 TF更新
// =========================================
export const handleUpdateTF = async (
  item: any,
  tf: string,
  load: () => Promise<void>
) => {
  await createLog(
    {
      user_id: item.user_id,
      pair: item.pair,
      timeframe_type: item.timeframe_type,
      direction: item.direction,
      phase: item.phase,
      timeframe: tf, // 🔥統一
      image_url: item.image_url,
      action: ACTIONS[0], // board_update
    },
    "board_action"
  );

  await load();
};

// =========================================
// 🔁 DnD処理
// =========================================
export const handleDnD = async (
  result: any,
  boards: any[],
  load: () => Promise<void>
) => {
  const { source, destination, draggableId } = result;

  if (!destination) return;

  const item = boards.find(
    (b: any) => b.id.toString() === draggableId
  );

  if (!item) return;

  const toPhase = destination.droppableId.split("-")[1];
  const isHTF = destination.droppableId.startsWith("long");
  const toTF = isHTF ? "HTF" : "LTF";

  // =====================================
  // 🟥 WAIT → CENTER（生成）
  // =====================================
  if (item.phase === "Wait" && destination.droppableId !== "wait") {
    const action = isHTF ? "create_HTF" : "create_LTF";

    await createLog(
      {
        user_id: item.user_id,
        pair: item.pair,
        timeframe_type: toTF,
        direction: isHTF ? "long" : null,
        phase: toPhase,
        image_url: item.image_url,
        action,
      },
      "board_action" // 🔥これが原因だった
    );

    await load();
    return;
  }

  // =====================================
  // 🟥 CENTER → WAIT（リセット）
  // =====================================
  if (destination.droppableId === "wait") {
    await createLog(
      {
        user_id: item.user_id,
        pair: item.pair,
        timeframe_type: null,
        direction: null,
        phase: "Wait",
        image_url: item.image_url,
        action: "move_to_wait",
      },
      "board_action"
    );

    await load();
    return;
  }

  // =====================================
  // 🟦 通常移動（フェーズ変更）
  // =====================================
  await createLog(
    {
      user_id: item.user_id,
      pair: item.pair,
      timeframe_type: toTF,
      direction: item.direction, // ←🔥ここも修正（nullやめる）
      phase: toPhase,
      image_url: item.image_url,
      action: "board_update",
    },
    "board_action"
  );

  await load();
};