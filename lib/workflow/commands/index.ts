// =========================================
// 🧠 Commands（唯一の処理層）【完成版】
// =========================================

import { createLog } from "../../workflow/core/logEngine";

import {
  PHASES,
  DIRECTIONS,
  TIMEFRAME_TYPES,
  ACTIONS,
  LOG_SOURCES,
} from "@/lib/constants/LogOptions";


// =========================================
// 🟥 WAITへ移動
// =========================================
export const moveToWaitCommand = async (item: any) => {
  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: item.timeframe_type,
    direction: null,
    phase: PHASES[0],
    image_url: item.image_url,
    action: ACTIONS[3],
  }, LOG_SOURCES[0]); // board_action
};


// =========================================
// 🟦 SHORT作成（新規）
// =========================================
export const createShortCommand = async (item: any) => {
  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: TIMEFRAME_TYPES[2],
    direction: DIRECTIONS[1],
    phase: PHASES[2],
    image_url: item.image_url ?? null,
    action: ACTIONS[2], // create_LTF
  }, LOG_SOURCES[0]);
};


// =========================================
// 🟩 方向切替
// =========================================
export const toggleDirectionCommand = async (item: any) => {
  const newDir =
    item.direction === DIRECTIONS[0]
      ? DIRECTIONS[1]
      : DIRECTIONS[0];

  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: item.timeframe_type,
    direction: newDir,
    phase: item.phase,
    image_url: item.image_url,
    action: ACTIONS[0],
  }, LOG_SOURCES[0]);
};


// =========================================
// 🟨 ボード削除
// =========================================
export const removeBoardCommand = async (item: any) => {
  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: item.timeframe_type,
    direction: item.direction,
    phase: PHASES[0],
    image_url: item.image_url,
    action: ACTIONS[4], // delete_board
  }, LOG_SOURCES[0]);
};


// =========================================
// 🟦 LONGフェーズ更新
// =========================================
export const updateLongPhaseCommand = async (
  item: any,
  phase: string
) => {
  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: TIMEFRAME_TYPES[0],
    direction: item.direction,
    phase,
    image_url: item.image_url,
    action: ACTIONS[0],
  }, LOG_SOURCES[0]);
};


// =========================================
// 🟩 SHORTフェーズ更新
// =========================================
export const updateShortPhaseCommand = async (
  item: any,
  phase: string
) => {
  await createLog({
    user_id: item.user_id,
    pair: item.pair,
    timeframe_type: TIMEFRAME_TYPES[2],
    direction: item.direction,
    phase,
    image_url: item.image_url,
    action: ACTIONS[0],
  }, LOG_SOURCES[0]);
};


// =========================================
// 🟥 WAIT → 作成（DnD用）
// =========================================
export const createFromWaitCommand = async (
  userId: string,
  pair: string,
  droppableId: string
) => {
  const type = droppableId.startsWith("long")
    ? TIMEFRAME_TYPES[0]
    : TIMEFRAME_TYPES[2];

  await createLog({
    user_id: userId,
    pair,
    timeframe_type: type,
    direction: DIRECTIONS[0],
    phase: PHASES[2],
    image_url: null,
    action: ACTIONS[0],
  }, LOG_SOURCES[0]);
};