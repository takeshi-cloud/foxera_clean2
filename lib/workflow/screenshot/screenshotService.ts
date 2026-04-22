import { supabase } from "@/lib/infra/supabase";

// =========================================
// 📸 保存（記録）
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
    date: today,        // ← 押した日
    path,
    type,
    timeframe,
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