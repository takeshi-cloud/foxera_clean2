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

  return data ?? [];
};

// =========================================
// 📸 保存（UPLOAD用：修正版）
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
  // 🔥 日付の正規化（最重要）
  // =============================
  const safeDate = date
    ? date.slice(0, 10) // ← ISOでも絶対YYYY-MM-DDにする
    : new Date().toISOString().slice(0, 10);

  // =============================
  // 🔥 pathの検証（超重要）
  // =============================
  if (!path.includes("/")) {
    console.error("❌ path壊れてる:", path);
    throw new Error("invalid path");
  }

  // =============================
  // 🔥 保存
  // =============================
  const { error } = await supabase.from("screenshots").insert({
    user_id: userId,
    symbol,
    date: safeDate, // ← 絶対YYYY-MM-DD
    path,           // ← 必ず userId/filename.png
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