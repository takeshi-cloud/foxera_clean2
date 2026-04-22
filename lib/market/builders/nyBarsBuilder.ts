import { getIntradayOHLC } from "../ingest/getIntradayOHLC";
import { getBaseTime } from "../utils/getBaseTime";
import { buildOHLCFromRange } from "../../market/transform/buildOHLCFromRange";

export const nyBarsBuilder = async (pair: string) => {
  const log = (step: string, data?: any) => {
    console.log("🧱", step, data ?? "");
  };

  try {
    log("START nyBarsBuilder", { pair });

    const dailyRange = getBaseTime("daily");
    const weeklyRange = getBaseTime("weekly");

    const fetchFrom = new Date(weeklyRange.start);
    fetchFrom.setUTCDate(fetchFrom.getUTCDate() - 5); // ← 余裕増やす

    const fetchTo = dailyRange.end;

    log("FETCH RANGE", {
      from: fetchFrom.toISOString(),
      to: fetchTo.toISOString(),
    });

    const intraday = await getIntradayOHLC(pair, fetchFrom, fetchTo);

    log("INTRADAY COUNT", intraday?.length);

    if (!intraday || intraday.length === 0) {
      log("❌ intraday empty");

      return {
        prevDaily: null,
        prevWeekly: null,

        // 🔥 debug追加（重要）
        debug: {
          range: {
            fetchFrom: fetchFrom.toISOString(),
            fetchTo: fetchTo.toISOString(),

            dailyStart: dailyRange.start.toISOString(),
            dailyEnd: dailyRange.end.toISOString(),

            weeklyStart: weeklyRange.start.toISOString(),
            weeklyEnd: weeklyRange.end.toISOString(),
          },
          counts: {
            intraday: 0,
            daily: 0,
            weekly: 0,
          },
        },
      };
    }

    // =========================
    // FILTER（ここが重要）
    // =========================

    const dailyData = intraday.filter(
      (d) =>
        new Date(d.timestamp_utc) >= dailyRange.start &&
        new Date(d.timestamp_utc) <= dailyRange.end
    );

    const weeklyData = intraday.filter(
      (d) =>
        new Date(d.timestamp_utc) >= weeklyRange.start &&
        new Date(d.timestamp_utc) <= weeklyRange.end
    );

    log("FILTER RESULT", {
      dailyCount: dailyData.length,
      weeklyCount: weeklyData.length,
    });

    // =========================
    // BUILD（緩和）
    // =========================

    const build = (data: any[]) => {
      if (!data.length) return null;

      return {
        open: data[0].open,
        high: Math.max(...data.map((d) => d.high)),
        low: Math.min(...data.map((d) => d.low)),
        close: data[data.length - 1].close,
      };
    };

    const prevDaily = build(dailyData);
    const prevWeekly = build(weeklyData);

    log("BUILD RESULT", {
      hasDaily: !!prevDaily,
      hasWeekly: !!prevWeekly,
    });

    // =========================
    // 最終
    // =========================

    const result = {
      prevDaily: prevDaily ?? null,
      prevWeekly: prevWeekly ?? null,

      // 🔥 debug追加（ここが今回の本命）
      debug: {
        range: {
          fetchFrom: fetchFrom.toISOString(),
          fetchTo: fetchTo.toISOString(),

          dailyStart: dailyRange.start.toISOString(),
          dailyEnd: dailyRange.end.toISOString(),

          weeklyStart: weeklyRange.start.toISOString(),
          weeklyEnd: weeklyRange.end.toISOString(),
        },

        counts: {
          intraday: intraday.length,
          daily: dailyData.length,
          weekly: weeklyData.length,
        },
      },
    };

    if (!prevDaily || !prevWeekly) {
      log("⚠️ PARTIAL BUILD", {
        prevDaily,
        prevWeekly,
      });

      return result;
    }

    log("SUCCESS nyBarsBuilder");

    return result;

  } catch (e: any) {
    console.error("💥 nyBarsBuilder FATAL:", e);

    return {
      prevDaily: null,
      prevWeekly: null,

      debug: {
        error: e.message,
      },
    };
  }
};