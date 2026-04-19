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
      return null;
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

    if (!prevDaily || !prevWeekly) {
      log("⚠️ PARTIAL BUILD", {
        prevDaily,
        prevWeekly,
      });

      // 👉 throwしない
      return {
        prevDaily: prevDaily ?? null,
        prevWeekly: prevWeekly ?? null,
      };
    }

    log("SUCCESS nyBarsBuilder");

    return { prevDaily, prevWeekly };

  } catch (e: any) {
    console.error("💥 nyBarsBuilder FATAL:", e);
    return null;
  }
};