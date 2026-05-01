import { supabase } from "@/lib/infra/supabase";

type SaveMAStructureParams = {
  pair: string;
   base_time: string;
  base_15m: string;
  base_1h: string;
  base_4h: string;
  price: number;
  ma_now_15: number;
  ma_prev_15: number;
  ma_now_1h: number;
  ma_prev_1h: number;

  ma_now_4h: number;
  ma_prev_4h: number;

  structure_order: string[];
};

// =========================================
// MA構造保存（最新のみ）
// =========================================
export async function saveMAStructure(
  params: SaveMAStructureParams
) {
  const { data, error } =
    await supabase
      .from("ma_structure_history") // ←変更
      .upsert(params, {
        onConflict: "pair", // ←ここが核心
      })
      .select()
      .single();

  if (error) {
    console.error("❌ saveMAStructure error:", error);
    throw error;
  }

  return data;
}