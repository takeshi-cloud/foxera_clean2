import { supabase } from "@/lib/infra/supabase";
import { getPivot } from "@/lib/market/ingest/getPivot";
import { getOrFetchPrice } from "../ingest/getOrFetchPrice";
import { calcRadar } from "../indicators/pivotRadar";
import { saveRadar } from "../../pivot_radar/storage/pivotRadarService";
import { getBaseTime } from "../utils/getBaseTime";

export const runOnePair = async (MARKET: string) => {
  const trace: any = {
    flow: [],
    baseTime: {},
    steps: {},
    errors: [],
  };

  // 🔥 後方互換あり（ここだけ修正）
  const log = (a: string, b?: any, c?: any) => {
    let type = "FLOW";
    let msg = "";
    let data = null;

    // 新形式対応
    if (c !== undefined) {
      type = a;
      msg = b;
      data = c;
    } else {
      // 旧形式そのまま通す
      msg = a;
      data = b ?? null;
    }

    const entry = {
      type,
      step: msg,
      data,
      time: new Date().toISOString(),
    };

    trace.flow.push(entry);

    console.log(`[${type}] ${msg}`, data ?? "");
  };

  try {
    log("START runOnePair", MARKET);

    // =========================================
    // BASE TIME
    // =========================================
    const daily = getBaseTime("daily");
    const weekly = getBaseTime("weekly");

    const dailyStr = daily.end.toISOString().slice(0, 10);
    const weeklyStr = weekly.start.toISOString().slice(0, 10);

    trace.baseTime = { daily, weekly, dailyStr, weeklyStr };

    log("BASE TIME CREATED", trace.baseTime);

    // =========================================
    // CACHE CHECK
    // =========================================
    let latest = null;

    log("CACHE CHECK START");

    try {
      const res = await supabase
        .from("pivot_radar_history")
        .select("*")
        .eq("symbol", MARKET)
        .eq("type", "daily_weekly")
        .eq("source_daily_date", dailyStr)
        .eq("source_week_start", weeklyStr)
        .maybeSingle();

      latest = res.data;

      log("CACHE RESULT", { found: !!latest });
    } catch (e: any) {
      trace.errors.push({ step: "cache", error: e.message });
      log("CACHE ERROR", e.message);
    }

    let isFresh = false;

    if (latest?.price_timestamp) {
  const latestDate =
    new Date(
      latest.price_timestamp
    );

  const diffMin =
    (Date.now() -
      latestDate.getTime()) /
    60000;

isFresh = diffMin < 5;

  log(
    "CACHE DEBUG",
    {
      symbol: MARKET,

      dbTimestamp:
        latest.price_timestamp,

      parsed:
        latestDate.toISOString(),

      now:
        new Date().toISOString(),

      diffMin,

      isFresh,
    }
  );

  log(
    "CACHE AGE CHECK",
    {
      diffMin,
      isFresh,
    }
  );
} else {
  log(
    "CACHE SKIP (no timestamp)"
  );
}

    // =========================================
    // PIVOT
    // =========================================
    log("CALL getPivot");

    let pivot: any = null;

    try {
      const pivotResult = await getPivot(MARKET);

      if ((pivotResult as any)?.trace?.flow) {
        trace.flow.push(...(pivotResult as any).trace.flow);
      }

      pivot = pivotResult;

      log("PIVOT RESULT", {
        exists: !!pivot,
        hasDaily: !!pivot?.daily,
        hasWeekly: !!pivot?.weekly,
      });
    } catch (e: any) {
      trace.errors.push({ step: "pivot", error: e.message });
      log("PIVOT ERROR", e.message);
    }

    if (!pivot?.daily || !pivot?.weekly) {
      log("PIVOT FAILED → RETURN");
      return { step: "pivot_failed", trace };
    }

    // =========================================
    // PRICE
    // =========================================
    log("CALL getOrFetchPrice");

    let priceData: any = null;

    try {
      priceData = await getOrFetchPrice(MARKET);
      log("PRICE RESULT", priceData);
    } catch (e: any) {
      trace.errors.push({ step: "price", error: e.message });
      log("PRICE ERROR", e.message);
    }

    if (!priceData?.price) {
      log("PRICE FAILED → RETURN");
      return { step: "price_failed", trace };
    }

    // =========================================
    // RADAR
    // =========================================
    log("CALL calcRadar");

    let radar: any = null;

    try {
      radar = calcRadar(pivot, priceData.price);
      log("RADAR RESULT", radar);
    } catch (e: any) {
      trace.errors.push({ step: "radar", error: e.message });
      log("RADAR ERROR", e.message);
    }

    if (!radar) {
      log("RADAR FAILED → RETURN");
      return { step: "radar_failed", trace };
    }

    // =========================================
    // SAVE
    // =========================================
    if (!isFresh) {
      log("SAVE START");

      try {
        await saveRadar({
          symbol: MARKET,
          type: "daily_weekly",
          x: radar.weekly.position,
          y: radar.daily.position,
          timestamp: new Date().toISOString(),
          price: priceData.price,
          price_timestamp: priceData.timestamp,
          source_daily_date: dailyStr,
          source_week_start: weeklyStr,
        });

        log("SAVE DONE");
      } catch (e: any) {
        trace.errors.push({ step: "save", error: e.message });
        log("SAVE ERROR", e.message);
      }
    } else {
      log("SAVE SKIPPED (CACHE)");
    }

    log("SUCCESS END");

    return {
      step: isFresh ? "cache" : "success",

      summary: {
        price: {
          value: priceData.price,
          time: priceData.timestamp,
        },

        radar: {
          x: radar.weekly.position,
          y: radar.daily.position,
          time: new Date().toISOString(),
        },

        pivot: {
          daily: pivot.daily,
          weekly: pivot.weekly,
          dailyDate: dailyStr,
          weeklyDate: weeklyStr,
        },

        ohlc: {
          daily: pivot.daily?.ohlc ?? null,
          weekly: pivot.weekly?.ohlc ?? null,
        },

       debug: {
  pivotRaw: pivot,

  // 🔥 これ追加（これが本体）
  ny: pivot?.debug?.ny ?? null,
  raw: pivot?.debug?.raw ?? null,
  baseTime: pivot?.debug?.baseTime ?? null,
   weeklyCheck: pivot?.debug?.weeklyCheck ?? null,
}
      },

      trace,
    };

  } catch (e: any) {
    log("FATAL ERROR", e.message);

    return {
      step: "exception",
      error: e.message,
      trace,
    };
  }
};