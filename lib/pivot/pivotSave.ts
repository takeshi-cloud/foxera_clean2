export async function upsertPivotDaily(
  supabase: any,
  data: {
    symbol: string;
    type: string;
    pivot: number;
    r1: number | null;
    r2: number | null;
    r3: number | null;
    s1: number | null;
    s2: number | null;
    s3: number | null;
    source_daily_date: string;
  }
) {
  if (!data.source_daily_date) {
    throw new Error("source_daily_date is required");
  }

  const payload = {
    symbol: data.symbol,
    timeframe: "daily",
    type: data.type,

    pivot: data.pivot,
    r1: data.r1,
    r2: data.r2,
    r3: data.r3,
    s1: data.s1,
    s2: data.s2,
    s3: data.s3,

    source_daily_date: data.source_daily_date,
    source_week_start: null, // 🔥必ずNULL
  };

  const { data: result, error } = await supabase
    .from("pivot_levels")
    .upsert([payload], {
      onConflict: "symbol,timeframe,source_daily_date",
    })
    .select()
    .single();

  if (error) {
    console.error("pivot_daily upsert error:", error);
    throw error;
  }

  return result;
}

export async function upsertPivotWeekly(
  supabase: any,
  data: {
    symbol: string;
    type: string;
    pivot: number;
    r1: number | null;
    r2: number | null;
    r3: number | null;
    s1: number | null;
    s2: number | null;
    s3: number | null;
    source_week_start: string;
  }
) {
  if (!data.source_week_start) {
    throw new Error("source_week_start is required");
  }

  const payload = {
    symbol: data.symbol,
    timeframe: "weekly",
    type: data.type,

    pivot: data.pivot,
    r1: data.r1,
    r2: data.r2,
    r3: data.r3,
    s1: data.s1,
    s2: data.s2,
    s3: data.s3,

    source_daily_date: null, // 🔥必ずNULL
    source_week_start: data.source_week_start,
  };

  const { data: result, error } = await supabase
    .from("pivot_levels")
    .upsert([payload], {
      onConflict: "symbol,timeframe,source_week_start",
    })
    .select()
    .single();

  if (error) {
    console.error("pivot_weekly upsert error:", error);
    throw error;
  }

  return result;
}