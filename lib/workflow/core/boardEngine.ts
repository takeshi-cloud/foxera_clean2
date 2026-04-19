// =========================================
// 🧠 boardEngine（状態の中枢・完成版）
// =========================================

import { supabase } from "../../infra/supabase";
import { LogSourceType } from "@/lib/constants/LogOptions";

// -----------------------------------------
// 🔧 normalize
// -----------------------------------------
const normalize = (p: string) =>
  p?.replace("/", "").toUpperCase();

// =========================================
// 🚀 メイン
// =========================================


export const updateBoardFromLog = async (
  log: any,
  source: LogSourceType = "board_action"
) => {
  try {
    const pair = normalize(log.pair);
    const user_id = log.user_id;

    if (!user_id) {
      console.error("❌ user_id missing", log);
      return;
    }

    // =====================================
    // 🧭 timeframe決定
    // =====================================
    let timeframe_type = log.timeframe_type;

    if (log.action === "create_HTF") {
      timeframe_type = "HTF";
    }

    if (log.action === "create_LTF") {
      timeframe_type = "LTF";
    }

    if (!timeframe_type) {
      console.error("❌ timeframe_type invalid", log);
      return;
    }

    // =====================================
    // 📥 既存取得
    // =====================================
    const { data: existing } = await supabase
      .from("board")
      .select("*")
      .eq("user_id", user_id)
      .eq("pair", pair)
      .eq("timeframe_type", timeframe_type)
      .single();

    const isForce = log.force_update === true;

 // =====================================
// ⏱ 時間判定（最重要）
// =====================================
if (!isForce && existing?.event_time) {
  const newTime = new Date(log.event_time).getTime();
  const currentTime = new Date(existing.event_time).getTime();

  // =====================================
  // 📌 upload（記録） → 弱い
  // =====================================
  // ・過去の情報を後から登録する用途
  // ・現在の状態を壊さないことが最優先
  // 👉 古いなら無視
  if (source === "upload") {
    if (newTime <= currentTime) {
      console.log("⛔ upload: 古いログなので無視");
      return;
    }
  }

  // =====================================
  // 📌 board_action（UI操作） → 強い
  // =====================================
  // ・ユーザーが「今こうだ」と判断した状態
  // 👉 基本は上書き（時間無視でもOK）
  if (source === "board_action") {
    // 通常は何も制限しない（常に更新）
    // 必要ならここで「極端に古いものだけ拒否」など追加可能
  }

  // =====================================
  // 📌 system（自動処理） → 中間（将来用）
  // =====================================
  // ・ロジックやAIによる自動更新
  // 👉 基本は時間に従う
  if (source === "system") {
    if (newTime <= currentTime) {
      console.log("⛔ system: 古いので更新しない");
      return;
    }
  }
}

    // =====================================
    // 🧱 next生成
    // =====================================
    const next = {
      user_id,
      pair,
      timeframe_type,

      phase:
        log.action === "move_to_wait"
          ? "Wait"
          : log.phase ?? existing?.phase ?? "Reversal",

 direction:
  log.action === "move_to_wait" || log.action === "delete_board"
    ? null // ←🔥これで全部解決
    : log.direction !== undefined
    ? log.direction
    : existing?.direction ?? null,

      image_url: log.image_url ?? existing?.image_url ?? null,

      // 🔥 最重要
      event_time: log.event_time,

      updated_at: new Date().toISOString(),
    };

    console.log("🟡 board next:", next);

    // =====================================
    // 🧹 強制時：未来ログ削除（重要仕様）
    // =====================================
    if (isForce) {
      const confirmDelete = true; // ← UI側で確認してから来る想定

      if (confirmDelete) {
        const { error: deleteFutureError } = await supabase
        .from("event_logs")
        .delete()
        .eq("user_id", user_id)
        .eq("pair", pair) // ←🔥追加
        .eq("timeframe_type", timeframe_type) // ←🔥追加
        .gt("event_time", log.event_time);

        if (deleteFutureError) {
          console.error("❌ future logs delete error:", deleteFutureError);
          return;
        }

        console.log("🧹 future logs deleted");
      }
    }

    // =====================================
    // 🗑 board削除
    // =====================================
    const { error: deleteError } = await supabase
      .from("board")
      .delete()
      .eq("user_id", user_id)
      .eq("pair", pair)
      .eq("timeframe_type", timeframe_type);

    if (deleteError) {
      console.error("❌ delete error:", deleteError);
      return;
    }

    // =====================================
    // 💾 insert
    // =====================================
    const { error: insertError } = await supabase
      .from("board")
      .insert([next]);

    if (insertError) {
      console.error("❌ insert error:", insertError);
    } else {
      console.log("✅ board updated");
    }

  } catch (e) {
    console.error("💥 boardEngine crash:", e);
  }
};