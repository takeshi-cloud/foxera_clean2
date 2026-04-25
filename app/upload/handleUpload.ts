import { supabase } from "@/lib/infra/supabase";
import { createLog } from "@/lib/workflow/core/logEngine";
import { saveScreenshotV2 } from "@/lib/workflow/screenshot/screenshotService";

export async function handleUpload(formData: FormData) {
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string;
  const pair = formData.get("pair") as string;
  const timeframeType = formData.get("timeframeType") as string;
  const direction = formData.get("direction") as string;
  const phase = formData.get("phase") as string;
  const date = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!file) {
    return { success: false, message: "ファイルがありません" };
  }

  try {
    // ============================
    // 🔥 Storage に画像保存
    // ============================
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return { success: false, message: "画像の保存に失敗しました" };
    }

    // ============================
    // 🔥 screenshots 保存
    // ============================
    try {
      await saveScreenshotV2({
        userId,
        symbol: pair,
        path: filePath,
        date,
        type: "context",
        notes: note,
      });
    } catch (err) {
      console.error("⚠️ screenshot保存失敗:", err);
    }

    // ============================
    // 🔥 event_log 保存（修正版）
    // ============================

    // ✅ timeframe補正
    const timeframeMap: any = {
      short: "LTF",
      long: "HTF",
    };
    const fixedTimeframe =
      timeframeMap[timeframeType] ?? timeframeType;

    try {
      console.log("▶ createLog start", {
        pair,
        timeframeType,
        fixedTimeframe,
        date,
      });

      await createLog(
        {
          user_id: userId,
          pair,
          timeframe_type: fixedTimeframe,
          direction,
          phase,
          note,
          event_time: `${date}T00:00:00`,
          action: "upload_screenshots",
          force_update: true,
        },
        "upload"
      );

      console.log("✅ createLog success");

    } catch (err) {
      console.error("❌ createLog失敗:", err);
    }

    return { success: true, message: "保存完了！" };

  } catch (err) {
    console.error("STOP: 全体エラー:", err);
    return { success: false, message: "不明エラー" };
  }
}