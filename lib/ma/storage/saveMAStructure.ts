import { supabase } from "@/lib/infra/supabase";

type SaveMAStructureParams = {
  pair: string;
  base_time: string;

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
// MA構造保存
// =========================================
export async function saveMAStructure(
  params: SaveMAStructureParams
) {
  const {
    pair,
    base_time,

    price,

    ma_now_15,
    ma_prev_15,

    ma_now_1h,
    ma_prev_1h,

    ma_now_4h,
    ma_prev_4h,

    structure_order,
  } = params;

  const { data, error } =
    await supabase
      .from("ma_structure_history")
      .upsert(
        {
          pair,
          base_time,

          price,

          ma_now_15,
          ma_prev_15,

          ma_now_1h,
          ma_prev_1h,

          ma_now_4h,
          ma_prev_4h,

          structure_order,
        },
        {
          onConflict:
            "pair,base_time",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "❌ saveMAStructure error:",
      error
    );
    throw error;
  }

  return data;
}