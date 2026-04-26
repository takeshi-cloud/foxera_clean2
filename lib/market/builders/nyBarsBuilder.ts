import { getIntradayOHLC } from "../ingest/getIntradayOHLC";
import { getBaseTime } from "../utils/getBaseTime";

export const nyBarsBuilder = async (pair: string) => {
  const log = (step: string, data?: any) => {
    console.log("🧱", step, data ?? "");
  };

  try {
    const dailyRange = getBaseTime("daily");
    const weeklyRange = getBaseTime("weekly");

    const fetchFrom = new Date(weeklyRange.start);
    fetchFrom.setUTCDate(fetchFrom.getUTCDate() - 2);

    const fetchTo = dailyRange.end;

    log("FETCH RANGE", {
      from: fetchFrom.toISOString(),
      to: fetchTo.toISOString(),
    });

    const intraday = await getIntradayOHLC(pair, fetchFrom, fetchTo);
    log("INTRADAY RANGE", {
  start: intraday[0]?.timestamp_utc,
  end: intraday[intraday.length - 1]?.timestamp_utc,
  count: intraday.length,
});

    if (!intraday?.length) {
      return { h4: null, prevDaily: null, prevWeekly: null };
    }

    // =========================
    // FILTER（NY日足・週足）
    // =========================

    const dailyData = intraday.filter((d) => {
      const t = new Date(d.timestamp_utc);
      return t >= dailyRange.start && t < dailyRange.end;
    });

    const weeklyData = intraday.filter((d) => {
      const t = new Date(d.timestamp_utc);
      return t >= weeklyRange.start && t < weeklyRange.end;
    });

    // =========================
    // BUILD共通
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
    log("DAILY DATA RANGE", {
  start: dailyData[0]?.timestamp_utc,
  end: dailyData[dailyData.length - 1]?.timestamp_utc,
  count: dailyData.length,
  high: prevDaily?.high,
  low: prevDaily?.low,
});
    const prevWeekly = build(weeklyData);
    log("WEEKLY DATA RANGE", {
  start: weeklyData[0]?.timestamp_utc,
  end: weeklyData[weeklyData.length - 1]?.timestamp_utc,
  count: weeklyData.length,
});

    // =========================
    // 🔥 NY基準 4H生成（DST対応版）
    // =========================

    const build4H = (data: any[]) => {
      if (!data.length) return [];

      const result: any[] = [];

      const base = dailyRange.start.getTime(); // ← NY開始（DST込み）

      let current: any[] = [];
      let currentBlock: number | null = null;

      for (const d of data) {
        const t = new Date(d.timestamp_utc).getTime();

        const block = Math.floor(
          (t - base) / (4 * 60 * 60 * 1000)
        );

        if (currentBlock === null) {
          currentBlock = block;
        }

        if (block !== currentBlock) {
          if (current.length) {
            result.push({
              open: current[0].open,
              high: Math.max(...current.map((x) => x.high)),
              low: Math.min(...current.map((x) => x.low)),
              close: current[current.length - 1].close,
              start: current[0].timestamp_utc,
              end: current[current.length - 1].timestamp_utc,
            });
          }

          current = [];
          currentBlock = block;
        }

        current.push(d);
      }

      if (current.length) {
        result.push({
          open: current[0].open,
          high: Math.max(...current.map((x) => x.high)),
          low: Math.min(...current.map((x) => x.low)),
          close: current[current.length - 1].close,
          start: current[0].timestamp_utc,
          end: current[current.length - 1].timestamp_utc,
        });
      }

      return result;
    };

    const h4 = build4H(intraday);
    log("H4 SAMPLE", h4?.[0]);

    return {
      h4,
      prevDaily,
      prevWeekly,

      debug: {
        range: {
          dailyStart: dailyRange.start,
          dailyEnd: dailyRange.end,
          weeklyStart: weeklyRange.start,
          weeklyEnd: weeklyRange.end,
        },
        counts: {
          intraday: intraday.length,
          daily: dailyData.length,
          weekly: weeklyData.length,
        },
      },
    };

  } catch (e: any) {
    console.error("💥 nyBarsBuilder:", e);

    return {
      h4: null,
      prevDaily: null,
      prevWeekly: null,
    };
  }
};