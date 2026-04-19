import { supabase } from "@/lib/infra/supabase";
import { getOrCreatePivot } from "@/lib/market/builders/pivoBuilder";
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

  const log = (msg: string, data?: any) => {
    trace.flow.push({
      step: msg,
      data: data ?? null,
      time: new Date().toISOString(),
    });
    console.log("🧭", msg, data ?? "");
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
      const diffMin =
        (Date.now() - new Date(latest.price_timestamp).getTime()) / 60000;

      isFresh = diffMin < 5;

      log("CACHE AGE CHECK", { diffMin, isFresh });
    } else {
      log("CACHE SKIP (no timestamp)");
    }

    // =========================================
    // PIVOT
    // =========================================
    log("CALL getOrCreatePivot");

    let pivot: any = null;

    try {
      const pivotResult = await getOrCreatePivot(MARKET);

      // 🔥 trace吸い上げ
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

      // 🔥 これ追加（レーダー表示に必要）
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
          dailyDate: dailyStr,
          weeklyDate: weeklyStr,
        },
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