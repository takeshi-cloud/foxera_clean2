import { supabase } from "@/lib/infra/supabase";

// =========================================
// 📸 保存（旧：簡易）
// =========================================
export const saveScreenshot = async ({
  symbol,
  path,
  type,
  timeframe,
}: {
  symbol: string;
  path: string;
  type?: string;
  timeframe?: string;
}) => {
  const today = new Date().toISOString().slice(0, 10);

  console.log("📸 SAVE (legacy)", {
    symbol,
    path,
  });

  const { error } = await supabase.from("screenshots").insert({
    symbol,
    date: today,
    path,
    ...(type && { type }),
    ...(timeframe && { timeframe }),
  });

  if (error) {
    console.error("❌ saveScreenshot:", error);
    throw error;
  }
};

// =========================================
// 🖼 取得（1週間以内）
// =========================================
export const fetchRecentScreenshots = async (
  symbols: string[]
) => {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  const fromDate = past.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("screenshots")
    .select("*")
    .in("symbol", symbols)
    .gte("date", fromDate)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ fetchScreenshots:", error);
    return [];
  }

  console.log("📦 FETCH RESULT", data);

  return data ?? [];
};

// =========================================
// 📸 保存（UPLOAD用：検証付き完全版）
// =========================================
export const saveScreenshotV2 = async ({
  userId,
  symbol,
  path,
  date,
  type,
  notes,
}: {
  userId: string;
  symbol: string;
  path: string;
  date?: string;
  type?: string;
  notes?: string;
}) => {
  // =============================
  // 日付
  // =============================
  const safeDate = date
    ? date.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  // =============================
  // path検証
  // =============================
  if (!path.includes("/")) {
    console.error("❌ path壊れてる:", path);
    throw new Error("invalid path");
  }

  // =============================
  // 🔥 保存前ログ（最重要）
  // =============================
  console.log("📸 SAVE V2", {
    userId,
    symbol,
    path,
    safeDate,
  });

  // =============================
  // 🔥 Storage存在チェック
  // =============================
  try {
    const parts = path.split("/");
    const fileName = parts.pop();
    const folder = parts.join("/");

    const { data: list, error: listError } = await supabase.storage
      .from("images")
      .list(folder);

    if (listError) {
      console.error("❌ STORAGE LIST ERROR", listError);
    } else {
      const exists = list?.some((f) => f.name === fileName);

      console.log("📂 STORAGE CHECK", {
        folder,
        fileName,
        exists,
        files: list,
      });

      if (!exists) {
        console.warn("⚠️ FILE NOT FOUND IN STORAGE", path);
      }
    }
  } catch (e) {
    console.error("❌ STORAGE CHECK CRASH", e);
  }

  // =============================
  // 保存
  // =============================
  const { error } = await supabase.from("screenshots").insert({
    user_id: userId,
    symbol,
    date: safeDate,
    path,
    ...(type && { type }),
    ...(notes && { notes }),
  });

  if (error) {
    console.error("❌ saveScreenshotV2:", error);
    throw error;
  }

  console.log("✅ screenshot saved:", {
    symbol,
    date: safeDate,
    path,
  });
};