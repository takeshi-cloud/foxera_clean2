import { getIntradayOHLC } from "../ingest/getIntradayOHLC";
import { getBaseTime } from "../utils/getBaseTime";

export const nyBarsBuilder = async (pair: string) => {

  const log = (type: string, step: string, data?: any) => {
    console.log(`[nyBars][${type}] ${step}`, data ?? "");
  };

  try {
    const dailyRange = getBaseTime("daily");
    const weeklyRange = getBaseTime("weekly");

    const fetchFrom = new Date(weeklyRange.start);
    fetchFrom.setUTCDate(fetchFrom.getUTCDate() - 2);

    const fetchTo = dailyRange.end;

    log("DATA", "FETCH RANGE", {
      from: fetchFrom.toISOString(),
      to: fetchTo.toISOString(),
    });

    const intraday = await getIntradayOHLC(pair, fetchFrom, fetchTo);

    log("DATA", "INTRADAY RANGE", {
      start: intraday[0]?.timestamp_utc,
      end: intraday[intraday.length - 1]?.timestamp_utc,
      count: intraday.length,
    });

    if (!intraday?.length) {
      log("ERROR", "NO INTRADAY DATA");
      return { h4: null, prevDaily: null, prevWeekly: null };
    }

    // =========================
    // FILTER
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
    // 🔥 極値の発生位置を取る（ロジック影響なし）
    // =========================

    const findExtremes = (data: any[]) => {
      if (!data.length) return null;

      let high = data[0];
      let low = data[0];

      for (const d of data) {
        if (d.high > high.high) high = d;
        if (d.low < low.low) low = d;
      }

      return {
        high: {
          value: high.high,
          time: high.timestamp_utc,
        },
        low: {
          value: low.low,
          time: low.timestamp_utc,
        },
      };
    };

    const dailyExt = findExtremes(dailyData);
    const weeklyExt = findExtremes(weeklyData);

    // =========================
    // BUILD
    // =========================

 const build = (data: any[]) => {
  if (!data.length) return null;

  return {
    open: data[0].open,
    high: Math.max(...data.map((d) => d.high)),
    low: Math.min(...data.map((d) => d.low)),
    close: data[data.length - 1].close,

    // 🔥 これ追加（これが欲しかったやつ）
    start: data[0].timestamp_utc,
    end: data[data.length - 1].timestamp_utc,
    count: data.length,
  };
};

    const prevDaily = build(dailyData);

    log("DATA", "DAILY SUMMARY", {
      range: {
        start: dailyData[0]?.timestamp_utc,
        end: dailyData[dailyData.length - 1]?.timestamp_utc,
      },
      count: dailyData.length,
      high: dailyExt?.high,
      low: dailyExt?.low,
    });

    const prevWeekly = build(weeklyData);

    log("DATA", "WEEKLY SUMMARY", {
      range: {
        start: weeklyData[0]?.timestamp_utc,
        end: weeklyData[weeklyData.length - 1]?.timestamp_utc,
      },
      count: weeklyData.length,
      high: weeklyExt?.high,
      low: weeklyExt?.low,
    });


console.log("=== DAILY BARS ===");
console.log(dailyData.map(b => b.timestamp_utc));

console.log("=== BASE TIME DAILY ===");
console.log(dailyRange.start, dailyRange.end);

console.log("=== WEEKLY BARS ===");
console.log(weeklyData.map(b => b.timestamp_utc));

console.log("=== BASE TIME WEEKLY ===");
console.log(weeklyRange.start, weeklyRange.end);



    // =========================
    // H4
    // =========================

    const build4H = (data: any[]) => {
      if (!data.length) return [];

      const result: any[] = [];
      const base = dailyRange.start.getTime();

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

    log("DATA", "H4 SAMPLE", h4?.[0]);

    return {
      h4,
      prevDaily,
      prevWeekly,
  raw: {
    daily: dailyData,
    weekly: weeklyData,
  },

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