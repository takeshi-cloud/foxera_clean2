import { supabase } from "@/lib/infra/supabase";
import type { PivotResult } from "../indicators/pivotCalc";

type SavePivotParams = {
  symbol: string;
  timeframe: "daily" | "weekly";
  pivot: PivotResult;
  date: string;

  sourceDailyDate?: string;
  sourceWeekStart?: string;
};

export const savePivotLevels = async ({
  symbol,
  timeframe,
  pivot,
  date,
  sourceDailyDate,
  sourceWeekStart,
}: SavePivotParams) => {
  // =========================================
  // 🔥 onConflictを正しく分岐
  // =========================================
  let onConflict: string;

  if (timeframe === "daily") {
    onConflict = "symbol,timeframe,source_daily_date";
  } else {
    onConflict = "symbol,timeframe,source_week_start";
  }

  const payload = {
    symbol,
    timeframe,
    type: "standard",

    pivot: pivot.PP,
    r1: pivot.R1,
    r2: pivot.R2,
    r3: pivot.R3,
    s1: pivot.S1,
    s2: pivot.S2,
    s3: pivot.S3,

    date,

    source_daily_date: sourceDailyDate ?? null,
    source_week_start: sourceWeekStart ?? null,
  };

  console.log("💾 savePivotLevels payload:", payload);
  console.log("🧠 onConflict:", onConflict);

  const { data, error } = await supabase
    .from("pivot_levels")
    .upsert(payload, {
      onConflict,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ savePivotLevels error:", error);
    throw error;
  }

  console.log("✅ savePivotLevels success:", data);

  return data;
};