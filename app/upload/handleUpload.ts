import { supabase } from "@/lib/infra/supabase";
import { createLog } from "@/lib/workflow/core/logEngine";

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

    // 🔥 ここだけ追加（File → Buffer変換）
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔥 ここだけ変更（file → buffer）
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return { success: false, message: "画像の保存に失敗しました" };
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // ============================
    // 🔥 🔥 ここが本質（統一）
    // ============================
    await createLog(
      {
        user_id: userId,
        pair,
        timeframe_type: timeframeType,
        direction,
        phase,
        image_url: imageUrl,
        note,
        event_time: date, // UI入力
        action: "upload_screenshots",
        force_update: true,
      },
      "upload" // 🔥これ超重要
    );

    return { success: true, message: "保存完了！", imageUrl };

  } catch (err) {
    console.error("STOP: 全体エラー:", err);
    return { success: false, message: "不明エラー" };
  }
}