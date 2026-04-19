import { buildMAStructure } from "./builders/buildMAStructure";
import { saveMAStructure } from "./storage/saveMAStructure";

// =========================================
// MA単体実行（検証用）
// =========================================
export async function runOnePairMA(
  pair: string
) {
  console.log("▶ START MA:", pair);

  const structure =
    await buildMAStructure(pair);

  console.log("📊 MA STRUCTURE:", structure);

  const saved =
    await saveMAStructure(structure);

  console.log("✅ MA SAVED");

  return saved;
}