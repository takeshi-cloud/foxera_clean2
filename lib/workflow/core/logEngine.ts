// =========================================
// 🧠 logEngine（全ての入口・完成版）
// =========================================

import { insertEventLog } from "../../workflow/log/event_logservice";
import { updateBoardFromLog } from "./boardEngine";
import { ActionType } from "@/lib/constants/LogOptions";
import { LogSourceType } from "@/lib/constants/LogOptions";

// -----------------------------------------
// 🎛 モード管理
// -----------------------------------------
let MODE: "manual" | "auto" | "both" = "manual";

export const setMode = (mode: "manual" | "auto" | "both") => {
  MODE = mode;
};

export const getMode = () => MODE;


// -----------------------------------------
// ⏱ event_time生成（修正版）
// -----------------------------------------
const buildEventTime = (input?: string) => {
  // 入力なし → 今
  if (!input) return new Date().toISOString();

  // 🔥 YYYY-MM-DD だけ来た場合（←今回の本質）
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return `${input}T00:00:00`;
  }

  const d = new Date(input);

  // 🔥 壊れ防止（最重要）
  if (isNaN(d.getTime())) {
    console.error("❌ invalid event_time:", input);
    return new Date().toISOString();
  }

  return d.toISOString();
};


// -----------------------------------------
// 🚀 メイン
// -----------------------------------------
export const createLog = async (
  log: {
    action: ActionType;
    pair?: string;
    timeframe_type?: string | null;
    direction?: string | null;
    phase?: string | null;
    note?: string;
    event_time?: string;
    force_update?: boolean;
    [key: string]: any;
  },
  source: LogSourceType
) => {
  try {
    // =====================================
    // 🎛 MODE制御
    // =====================================
    if (MODE === "auto" && source === "board_action") {
      console.log("⛔ manual操作は無効（AUTOモード）");
      return;
    }

    // =====================================
    // 🧹 正規化
    // =====================================
    const pair = log.pair?.replace("/", "").toUpperCase();
    const timeframe_type = log.timeframe_type?.toUpperCase();

    let direction =
      log.direction !== undefined
        ? log.direction?.toLowerCase()
        : undefined;

    let phase = log.phase ?? "Wait";

    if (log.action === "move_to_wait") {
      phase = "Wait";
      direction = null;
    }

    // =====================================
    // ⏱ event_time
    // =====================================
    const event_time = buildEventTime(log.event_time);

    // =====================================
    // 🔥 payload
    // =====================================
    const payload = {
      ...log,
      pair,
      timeframe_type,
      direction,
      phase,
      source,
      action: log.action ?? "board_update",
      note: log.note ?? "",
      event_time,
      force_update: log.force_update ?? false,
    };

    // =====================================
    // ❗ 最終防御
    // =====================================
    if (!payload.timeframe_type) {
      console.error("❌ timeframe_type null", payload);
      return;
    }

    console.log("🔥 createLog:", payload);

    // =====================================
    // 📝 event_logs 保存
    // =====================================
    await insertEventLog(payload);

    // =====================================
    // 🔄 board 更新
    // =====================================
    await updateBoardFromLog(payload, source);

  } catch (e) {
    console.error("💥 logEngine error:", e);
  }
};