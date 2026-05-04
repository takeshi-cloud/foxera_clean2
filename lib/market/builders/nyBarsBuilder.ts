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
  if (!data || !data.length) return null;

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

// =========================
// BUILD
// =========================

const build = (data: any[]) => {
  if (!data || !data.length) return null;

  return {
    open: data[0].open,
    high: Math.max(...data.map((d) => d.high)),
    low: Math.min(...data.map((d) => d.low)),
    close: data[data.length - 1].close,

    start: data[0].timestamp_utc,
    end: data[data.length - 1].timestamp_utc,
    count: data.length,
  };
};

// =========================================
// 🔥 異常値除去
// =========================================

const clean = (data: any[]) => {
  if (!data || !data.length) return [];

  return data.filter((b, i, arr) => {
    if (!b) return false;

    const high = Number(b.high);
    const low = Number(b.low);
    const close = Number(b.close);

    if (!high || !low || !close) return false;
    if (low <= 0) return false;

    if (i === 0) return true;

    const prev = arr[i - 1];
    const prevClose = Number(prev.close);
    if (!prevClose) return false;

    const ratioHigh = high / prevClose;
    const ratioLow = low / prevClose;

    if (ratioHigh > 1.2 || ratioLow < 0.8) {
      console.warn("🔥 REMOVE BAD BAR", {
        time: b.timestamp_utc,
        high,
        low,
        prevClose,
      });
      return false;
    }

    return true;
  });
};

// =========================
// 🔥 CLEAN適用（ここが本質）
// =========================

const dailyClean = clean(dailyData);
const weeklyClean = clean(weeklyData);

// 🔥 clean後で統一
const dailyExt = findExtremes(dailyClean);
const weeklyExt = findExtremes(weeklyClean);

const prevDaily = build(dailyClean);
const prevWeekly = build(weeklyClean);

// =========================
// LOG（clean後に合わせる）
// =========================

log("DATA", "DAILY SUMMARY", {
  range: {
    start: dailyClean[0]?.timestamp_utc,
    end: dailyClean[dailyClean.length - 1]?.timestamp_utc,
  },
  count: dailyClean.length,
  high: dailyExt?.high,
  low: dailyExt?.low,
});

log("DATA", "WEEKLY SUMMARY", {
  range: {
    start: weeklyClean[0]?.timestamp_utc,
    end: weeklyClean[weeklyClean.length - 1]?.timestamp_utc,
  },
  count: weeklyClean.length,
  high: weeklyExt?.high,
  low: weeklyExt?.low,
});

// =========================
// DEBUG
// =========================

console.log("=== DAILY BARS ===");
console.log(dailyClean.map((b) => b.timestamp_utc));

console.log("=== BASE TIME DAILY ===");
console.log(dailyRange.start, dailyRange.end);

console.log("=== WEEKLY BARS ===");
console.log(weeklyClean.map((b) => b.timestamp_utc));

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