// lib/boardService.ts

import { supabase } from "@/lib/infra/supabase";

// =====================================
// 📦 board取得
// =====================================
export const fetchBoards = async (userId: string) => {
  const { data, error } = await supabase
    .from("board")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("❌ fetchBoards error:", error);
    return [];
  }

  return data ?? [];
};