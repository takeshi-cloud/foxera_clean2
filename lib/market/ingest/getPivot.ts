import { supabase } from "@/lib/infra/supabase";
import { getBaseTime } from "../utils/getBaseTime";
import { pivotBuilder } from "../builders/pivotBuilder";

// helperはそのまま必要
const mapPivot = (p: any) => ({
  PP: p.pivot,
  R1: p.r1,
  R2: p.r2,
  R3: p.r3,
  S1: p.s1,
  S2: p.s2,
  S3: p.s3,
});

export const getPivot = async (symbol: string) => {
  const log = (step: string, data?: any) => {
    console.log(`[pivotBuilder] ${step}`, data ?? "");
  };

  log("START", { symbol });

  const dailyBase = getBaseTime("daily");
  const weeklyBase = getBaseTime("weekly");

  const dailyStr = dailyBase.end.toISOString().slice(0, 10);
  const weeklyStr = weeklyBase.start.toISOString().slice(0, 10);

  // =========================================
  // DB取得（←そのまま）
  // =========================================
  const { data: daily } = await supabase
    .from("pivot_levels")
    .select("*")
    .eq("symbol", symbol)
    .eq("timeframe", "daily")
    .eq("source_daily_date", dailyStr)
    .maybeSingle();

  const { data: weekly } = await supabase
    .from("pivot_levels")
    .select("*")
    .eq("symbol", symbol)
    .eq("timeframe", "weekly")
    .eq("source_week_start", weeklyStr)
    .maybeSingle();

  log("DB", { daily: !!daily, weekly: !!weekly });

  // =========================================
  // 完全キャッシュ（←そのまま）
  // =========================================
  if (daily && weekly) {
    log("CACHE HIT");
    return {
      daily: mapPivot(daily),
      weekly: mapPivot(weekly),
      debug: {
        source: "cache",
        bars: null,
        raw: { daily, weekly },
        baseTime: { daily: dailyBase, weekly: weeklyBase },
      },
    };
  }

  // =========================================
  // 🔥 ここだけ追加（1行）
  // =========================================
  return await pivotBuilder(symbol, {
    daily,
    weekly,
    dailyStr,
    weeklyStr,
    dailyBase,
    weeklyBase,
  });
};