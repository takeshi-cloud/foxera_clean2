import { supabase } from "@/lib/infra/supabase";
import { nyBarsBuilder } from "../builders/nyBarsBuilder";
import { calcPivot } from "../indicators/pivotCalc";
import {
  upsertPivotDaily,
  upsertPivotWeekly,
} from "../../../lib/pivot/pivotSave";

// helper（そのままコピー）
const mapPivot = (p: any) => ({
  PP: p.pivot,
  R1: p.r1,
  R2: p.r2,
  R3: p.r3,
  S1: p.s1,
  S2: p.s2,
  S3: p.s3,
});

export const pivotBuilder = async (
  symbol: string,
  ctx: any
) => {

  const log = (a: string, b?: any, c?: any) => {
    let type = "FLOW";
    let msg = "";
    let data = null;

    if (c !== undefined) {
      type = a;
      msg = b;
      data = c;
    } else {
      msg = a;
      data = b ?? null;
    }

    console.log(`[pivotBuilder][${type}] ${msg}`, data ?? "");
  };

  const {
    daily,
    weekly,
    dailyStr,
    weeklyStr,
    dailyBase,
    weeklyBase,
  } = ctx;

  log("FLOW", "NY BUILDER CALL");

  let bars: any = null;

  try {
    bars = await nyBarsBuilder(symbol);
  } catch (e: any) {
    log("ERROR", "NY BUILDER", e.message);
  }

  if (!bars) {
    log("ERROR", "NY BUILDER EMPTY");

    return {
      daily: null,
      weekly: null,
      debug: {
        source: "no-bars",
        bars: null,
        raw: null,
        baseTime: { daily: dailyBase, weekly: weeklyBase },
      },
    };
  }

// =========================================
// 🔥 VALIDATION
// =========================================

const DAILY_REQUIRED = 20;
const WEEKLY_REQUIRED = 110;

const dailyCount = bars.prevDaily?.count ?? 0;
const weeklyCount = bars.prevWeekly?.count ?? 0;

// Daily不足
if (dailyCount < DAILY_REQUIRED) {
  log("ERROR", "DAILY不足", { dailyCount });
  bars.prevDaily = null;
}

// Weekly不足
if (weeklyCount < WEEKLY_REQUIRED) {
  log("ERROR", "WEEKLY不足", { weeklyCount });
  bars.prevWeekly = null;
}

// =========================================
// 🔥 VALIDATION後に判定
// =========================================

const hasDailyBars = !!bars.prevDaily;
const hasWeeklyBars = !!bars.prevWeekly;

  // =========================================
  // 🔥 ① 元データ（既存）
  // =========================================
  log("DATA", "NY RESULT", {
    hasDailyBars,
    hasWeeklyBars,

    dailySource: bars.prevDaily
      ? {
          high: bars.prevDaily.high,
          low: bars.prevDaily.low,
          close: bars.prevDaily.close,
        }
      : null,

    weeklySource: bars.prevWeekly
      ? {
          high: bars.prevWeekly.high,
          low: bars.prevWeekly.low,
          close: bars.prevWeekly.close,
        }
      : null,
  });

console.log("=== WEEKLY RAW HIGH ===");
console.log(bars.raw?.weekly?.map((b:any) => b.high));

console.log("=== WEEKLY MAX HIGH ===");
console.log(
  Math.max(...(bars.raw?.weekly || []).map((b:any) => b.high))
);

  // =========================================
  // 🔥 ② 追加：期間ログ（これが今回の核心）
  // =========================================
  log("DATA", "NY RANGE", {
    daily: bars.prevDaily
      ? {
          start: bars.prevDaily.start ?? null,
          end: bars.prevDaily.end ?? null,
          count: bars.prevDaily.count ?? null,
        }
      : null,

    weekly: bars.prevWeekly
      ? {
          start: bars.prevWeekly.start ?? null,
          end: bars.prevWeekly.end ?? null,
          count: bars.prevWeekly.count ?? null,
        }
      : null,
  });

  // =========================================
  // 🔥 ③ 時間メタ（既存＋補強）
  // =========================================
  log("DATA", "NY SOURCE TIME", {
    daily: bars.prevDaily?.time ?? null,
    weekly: bars.prevWeekly?.time ?? null,
  });

  // 🔥 追加（pivotの日付）
  log("DATA", "PIVOT SOURCE DATE", {
    daily: dailyStr,
    weekly: weeklyStr,
  });

  // =========================================
  log("FLOW", "PIVOT SOURCE", {
    daily: hasDailyBars ? "NY" : "FALLBACK",
    weekly: hasWeeklyBars ? "NY" : "FALLBACK",
  });

  let d = daily;
  let w = weekly;

  // ================= DAILY =================
  if (!daily) {
    if (hasDailyBars) {

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

    } else {
      log("FLOW", "FALLBACK DAILY");

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
        log("RESULT", "FALLBACK DAILY OK");
      }
    }
  }

  // ================= WEEKLY =================
  if (!weekly) {
    if (hasWeeklyBars) {

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

    } else {
      log("FLOW", "FALLBACK WEEKLY");

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
        log("RESULT", "FALLBACK WEEKLY OK");
      }
    }
  }

  if (!d && !w) {
    log("ERROR", "FINAL FAIL (no pivot)");
    return null;
  }

  log("FLOW", "END");

  return {
  daily: d ? mapPivot(d) : null,
  weekly: w ? mapPivot(w) : null,

debug: {
  source: "build",

  ny: {
    daily: bars?.prevDaily || null,
    weekly: bars?.prevWeekly || null,
  },

  raw: {
    daily: bars?.raw?.daily || null,
    weekly: bars?.raw?.weekly || null,
  },

  // 👇 これ追加
  weeklyCheck: {
    high: Math.max(...bars.raw.weekly.map(b => b.high)),
    low: Math.min(...bars.raw.weekly.map(b => b.low)),
    close: bars.raw.weekly.at(-1)?.close,
  },

  baseTime: {
    daily: dailyBase,
    weekly: weeklyBase,
  },
}
};
};