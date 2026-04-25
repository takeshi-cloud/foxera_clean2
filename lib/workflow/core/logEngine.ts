// =========================================
// 🧠 logEngine（全ての入口・完成版）
// =========================================

import { insertEventLog } from "../../workflow/log/event_logservice";
import { updateBoardFromLog } from "./boardEngine";
import { ActionType } from "@/lib/constants/LogOptions";
import { LogSourceType } from "@/lib/constants/LogOptions";
import { supabase } from "@/lib/infra/supabase"; // ←追加

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
  if (!input) return new Date().toISOString();

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return `${input}T00:00:00`;
  }

  const d = new Date(input);

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
    if (MODE === "auto" && source === "board_action") {
      console.log("⛔ manual操作は無効（AUTOモード）");
      return;
    }

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

    const event_time = buildEventTime(log.event_time);

    // =====================================
    // 🧠 前回ログ取得（追加）
    // =====================================
    const { data: prevLogs } = await supabase
      .from("event_logs")
      .select("*")
      .eq("pair", pair)
      .eq("timeframe_type", timeframe_type)
      .eq("user_id", log.user_id) // ←重要
      .order("event_time", { ascending: false })
      .limit(1);

    const prev = prevLogs?.[0];

    // =====================================
    // 🧠 変化判定（追加）
    // =====================================
    const isDirectionChanged =
      direction !== undefined &&
      direction !== prev?.direction;

    const isPhaseChanged =
      phase !== undefined &&
      phase !== prev?.phase;

    const isCritical = isDirectionChanged || isPhaseChanged;

    // =====================================
    // 🧠 group_id決定（追加）
    // =====================================
    const group_id =
      isCritical || !prev?.group_id
        ? crypto.randomUUID()
        : prev.group_id;

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

      group_id, // ←🔥これだけ追加
    };

    if (!payload.timeframe_type) {
      console.error("❌ timeframe_type null", payload);
      return;
    }

    console.log("🔥 createLog:", payload);

    await insertEventLog(payload);

    await updateBoardFromLog(payload, source);

  } catch (e) {
    console.error("💥 logEngine error:", e);
  }
};