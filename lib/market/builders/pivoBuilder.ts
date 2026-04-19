import { supabase } from "@/lib/infra/supabase";
import { nyBarsBuilder } from "../builders/nyBarsBuilder";
import { calcPivot } from "../indicators/pivotCalc";
import {
  upsertPivotDaily,
  upsertPivotWeekly,
} from "../../../lib/pivot/pivotSave";
import { getBaseTime } from "../utils/getBaseTime";

export const getOrCreatePivot = async (symbol: string) => {
  const log = (step: string, data?: any) => {
    console.log(`[pivotBuilder] ${step}`, data ?? "");
  };

  log("START", { symbol });

  const dailyBase = getBaseTime("daily");
  const weeklyBase = getBaseTime("weekly");

  const dailyStr = dailyBase.end.toISOString().slice(0, 10);
  const weeklyStr = weeklyBase.start.toISOString().slice(0, 10);

  // =========================================
  // DB取得
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
  // 完全キャッシュ
  // =========================================
  if (daily && weekly) {
    log("CACHE HIT");
    return {
      daily: mapPivot(daily),
      weekly: mapPivot(weekly),
    };
  }

  // =========================================
  // NY足生成
  // =========================================
  log("NY BUILDER CALL");

  let bars: any = null;

  try {
    bars = await nyBarsBuilder(symbol);
  } catch (e: any) {
    log("NY BUILDER ERROR", e.message);
  }

  const hasDailyBars = !!bars?.prevDaily;
  const hasWeeklyBars = !!bars?.prevWeekly;

  log("NY RESULT", {
    daily: hasDailyBars,
    weekly: hasWeeklyBars,
  });

  let d = daily;
  let w = weekly;

  // =========================================
  // DAILY
  // =========================================
  if (!daily) {
    if (hasDailyBars) {
      log("BUILD DAILY");

      const p = calcPivot(
        bars.prevDaily.high,
        bars.prevDaily.low,
        bars.prevDaily.close
      );

      d = await upsertPivotDaily(supabase, {
        symbol,
        pivot: p.PP,
        r1: p.R1,
        r2: p.R2,
        r3: p.R3,
        s1: p.S1,
        s2: p.S2,
        s3: p.S3,
        source_daily_date: dailyStr,
        type: "standard",
      });

      log("SAVE DAILY OK");
    } else {
      // fallback
      log("FALLBACK DAILY");

      const { data } = await supabase
        .from("pivot_levels")
        .select("*")
        .eq("symbol", symbol)
        .eq("timeframe", "daily")
        .order("source_daily_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        d = data;
        log("FALLBACK DAILY OK");
      }
    }
  }

  // =========================================
  // WEEKLY
  // =========================================
  if (!weekly) {
    if (hasWeeklyBars) {
      log("BUILD WEEKLY");

      const p = calcPivot(
        bars.prevWeekly.high,
        bars.prevWeekly.low,
        bars.prevWeekly.close
      );

      w = await upsertPivotWeekly(supabase, {
        symbol,
        pivot: p.PP,
        r1: p.R1,
        r2: p.R2,
        r3: p.R3,
        s1: p.S1,
        s2: p.S2,
        s3: p.S3,
        source_week_start: weeklyStr,
        type: "standard",
      });

      log("SAVE WEEKLY OK");
    } else {
      // fallback
      log("FALLBACK WEEKLY");

      const { data } = await supabase
        .from("pivot_levels")
        .select("*")
        .eq("symbol", symbol)
        .eq("timeframe", "weekly")
        .order("source_week_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        w = data;
        log("FALLBACK WEEKLY OK");
      }
    }
  }

  // =========================================
  // 最終判定
  // =========================================
  if (!d && !w) {
    log("FINAL FAIL (no pivot)");
    return null;
  }

  log("END");

  return {
    daily: d ? mapPivot(d) : null,
    weekly: w ? mapPivot(w) : null,
  };
};

// =========================================
// helper
// =========================================
const mapPivot = (p: any) => ({
  PP: p.pivot,
  R1: p.r1,
  R2: p.r2,
  R3: p.r3,
  S1: p.s1,
  S2: p.s2,
  S3: p.s3,
});