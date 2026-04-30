import { buildMAStructure } from "./buildMAStructure";
import { saveMAStructure } from "../storage/saveMAStructure";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";

// =========================================
// MA単体実行（検証用）
// =========================================
export async function runOnePairMA(
  pair: string,
  inputDate: Date
) {
  console.log("▶ START MA:", pair);

  console.log("🕒 INPUT DATE:", inputDate.toISOString());

  // =========================================
  // 🔥 baseTime確認
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
  // 🔥 ここを修正（inputDate渡す）
  // =========================================
  const structure =
    await buildMAStructure(pair, inputDate);

  console.log("📊 MA STRUCTURE:", structure);

  // =========================================
  // 保存
  // =========================================
  const saved =
    await saveMAStructure(structure);

  console.log("✅ MA SAVED");

  return saved;
}

// =========================================
// 🔥 テスト用：2通貨だけ回す
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
      results.push({
        pair,
        error: true,
      });
    }
  }

  return results;
}