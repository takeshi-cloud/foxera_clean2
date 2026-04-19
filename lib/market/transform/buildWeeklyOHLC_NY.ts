import type { OHLC } from "./buildDailyOHLC_NY";
import { getNYDateKey } from "./toNY";

export type WeeklyOHLC = OHLC & {
  startDate: string;
  endDate: string;
};

export function buildWeeklyOHLC_NY(
  dailyBars: OHLC[]
): WeeklyOHLC[] {
  if (!dailyBars?.length) {
    throw new Error("No daily bars");
  }

  const weekMap: Record<string, WeeklyOHLC> = {};

  for (const bar of dailyBars) {
    const nyDate = getNYDateKey(bar.date);
    const d = new Date(nyDate);

    const day = d.getUTCDay();

    const sunday = new Date(d);
    sunday.setUTCDate(d.getUTCDate() - day);

    const weekKey = sunday.toISOString().slice(0, 10);

    if (!weekMap[weekKey]) {
      weekMap[weekKey] = {
        date: weekKey,
        startDate: weekKey,
        endDate: bar.date,

        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      };
    } else {
      const w = weekMap[weekKey];

      w.high = Math.max(w.high, bar.high);
      w.low = Math.min(w.low, bar.low);
      w.close = bar.close;
      w.endDate = bar.date;
    }
  }

  const keys = Object.keys(weekMap).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const result = keys.map((k) => weekMap[k]);

  if (!result.length) {
    throw new Error("Failed weekly build");
  }

  return result;
}