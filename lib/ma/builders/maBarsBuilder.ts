import { MA_PERIOD } from "@/lib/constants/markets";
import { build4HBarsForMA } from "@/lib/ma/builders/4HBarsBuilderForMA";
import { getBaseTime_MA } from "@/lib/ma/utils/getBaseTime_MA";
import { getBarsWithFetch } from "@/lib/market/ingest/getBarsWithFetch";

// =========================================
// MA計算用Bars取得（新構成：fetch統合版）
// =========================================
export async function maBarsBuilder(
  pair: string,
  inputDate: Date
) {
  console.log("\n========================");
  console.log("🚀 START MA BUILDER:", pair);
  console.log("========================");

  console.log("🕒 INPUT DATE:", inputDate.toISOString());

  // =========================================
  // baseTime
  // =========================================
  const base15 = getBaseTime_MA(inputDate, "15m");
  const base1h = getBaseTime_MA(inputDate, "1h");
  const base4h = getBaseTime_MA(inputDate, "4h");

  console.log("🕒 BASE TIMES", {
    base15: base15.toISOString(),
    base1h: base1h.toISOString(),
    base4h: base4h.toISOString(),
  });

  const required = MA_PERIOD + 1;

  // =========================================
  // データ取得
  // =========================================
  const bars15m = await getBarsWithFetch(
    pair,
    "15m",
    inputDate,
    required
  );

  const bars1h = await getBarsWithFetch(
    pair,
    "1h",
    inputDate,
    100 // 4H用
  );

  console.log("📊 FETCHED RESULT", {
    bars15m_count: bars15m.length,
    bars1h_count: bars1h.length,
    bars15m_range: {
      from: bars15m[0]?.timestamp_utc,
      to: bars15m[bars15m.length - 1]?.timestamp_utc,
    },
    bars1h_range: {
      from: bars1h[0]?.timestamp_utc,
      to: bars1h[bars1h.length - 1]?.timestamp_utc,
    },
  });

  // =========================================
  // 4H生成
  // =========================================
  const bars4h = build4HBarsForMA(
    bars1h,
    base4h,
    required
  );

  console.log("📊 4H RESULT", {
    count: bars4h.length,
    from: bars4h[0]?.timestamp_utc,
    to: bars4h[bars4h.length - 1]?.timestamp_utc,
  });

  // =========================================
  // FINAL CHECK
  // =========================================
  console.log("✅ FINAL CHECK", {
    last15: bars15m[bars15m.length - 1]?.timestamp_utc,
    last1h: bars1h[bars1h.length - 1]?.timestamp_utc,
    last4h: bars4h[bars4h.length - 1]?.timestamp_utc,
  });

  // =========================================
  // 🔥 時間整合チェック
  // =========================================
  const last15 = new Date(
    bars15m[bars15m.length - 1]?.timestamp_utc
  ).getTime();

  const last1h = new Date(
    bars1h[bars1h.length - 1]?.timestamp_utc
  ).getTime();

  const last4h = new Date(
    bars4h[bars4h.length - 1]?.timestamp_utc
  ).getTime();

  // 15mは厳密
  if (last15 < base15.getTime()) {
    throw new Error("❌ 15m時間不足");
  }

  // 1hも厳密
  if (last1h < base1h.getTime()) {
    throw new Error("❌ 1h時間不足");
  }

  // 4hは例外扱い（未完成許容）
  if (last4h < base4h.getTime()) {
    console.log("⚠️ 4H未完成 → 最新完成足を使用", {
      last4h: bars4h[bars4h.length - 1]?.timestamp_utc,
      base4h: base4h.toISOString(),
    });
  }

  return {
    bars15m,
    bars1h,
    bars4h,
  };
}