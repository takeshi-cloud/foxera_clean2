import { supabase } from "@/lib/infra/supabase";
import { buildMAStructure } from "./buildMAStructure";
import { saveMAStructure } from "../storage/saveMAStructure";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";

// =========================================
// MA単体実行（PIVOT型）
// =========================================
export async function runOnePairMA(
  pair: string,
  inputDate: Date
) {
  console.log("▶ START MA:", pair);

  console.log("🕒 INPUT DATE:", inputDate.toISOString());

  // =========================================
  // baseTime（ログ用）
  // =========================================
  const base15 = getBaseTime_MA(inputDate, "15m");
  const base1h = getBaseTime_MA(inputDate, "1h");
  const base4h = getBaseTime_MA(inputDate, "4h");

  console.log("🕒 BASE TIMES", {
    base15: base15.toISOString(),
    base1h: base1h.toISOString(),
    base4h: base4h.toISOString(),
  });

  // =========================================
  // 🔥 先に削除（これが核心）
  // =========================================
  const { error: deleteError } =
  await supabase
    .from("ma_structure_history")
    .delete()
    .eq("pair", pair);

if (deleteError) {
  console.error("❌ DELETE ERROR:", pair, deleteError);
} else {
  console.log("🧹 DELETE DONE:", pair);
}
  // =========================================
  // 計算
  // =========================================
  console.log("🚀 BUILD START:", pair);

  const structure =
    await buildMAStructure(pair, inputDate);

  console.log("📊 MA STRUCTURE:", structure);

  // =========================================
  // 保存（成功時のみ）
  // =========================================
  const saved =
    await saveMAStructure(structure);

  console.log("✅ MA SAVED");

  return saved;
}

// =========================================
// 🔥 テスト用：2通貨
// =========================================
export async function runTestMAPairs(
  inputDate: Date
) {
  const TEST_PAIRS = [
    "USD/JPY",
    "EUR/USD",
  ];

  const results = [];

  for (const pair of TEST_PAIRS) {
    try {
      const res = await runOnePairMA(pair, inputDate);
      results.push(res);
    } catch (err) {
      console.error("MA TEST ERROR:", pair, err);

      // 👉 失敗＝既に削除済みなのでそのまま
      results.push({
        pair,
        error: true,
      });
    }
  }

  return results;
}