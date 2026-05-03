import { supabase } from "@/lib/infra/supabase";

export const getCurrentStatus = async () => {

  const normalize = (p: string) =>
    p?.replace("/", "").toUpperCase();

  // =============================
  // MA（direction / phase）
  // =============================
  const { data: maRows } = await supabase
    .from("ma_structure_history")
    .select("pair, direction, phase, created_at")
    .order("created_at", { ascending: false });

  const maMap = new Map();

const fallbackMap = new Map(); // ← OTHER用

for (const row of maRows || []) {
  const key = normalize(row.pair);

  // 有効データ
  if (row.direction && row.direction !== "OTHER") {
    if (!maMap.has(key)) {
      maMap.set(key, row);
    }
  } 
  // fallback保存
  else {
    if (!fallbackMap.has(key)) {
      fallbackMap.set(key, row);
    }
  }
}

// fallback補完
for (const [key, row] of fallbackMap.entries()) {
  if (!maMap.has(key)) {
    maMap.set(key, row);
  }
}

  // =============================
  // Pivot（yだけ使う）
  // =============================
  const { data: pivotRows } = await supabase
    .from("pivot_radar_history")
    .select("symbol, y, timestamp")
    .order("timestamp", { ascending: false });

  const pivotMap = new Map();

  for (const row of pivotRows || []) {
    const key = normalize(row.symbol);

    if (!pivotMap.has(key)) {
      pivotMap.set(key, row);
    }
  }

  // =============================
  // 合成
  // =============================
  const result = [];

  for (const [key, ma] of maMap.entries()) {
    const pivot = pivotMap.get(key);

    result.push({
      pair: key,
      direction: ma.direction, // ← DOWN / UP
      phase: ma.phase,         // ← TRENDなど
      pivotY: pivot?.y ?? null,
    });
  }

  return result;
};