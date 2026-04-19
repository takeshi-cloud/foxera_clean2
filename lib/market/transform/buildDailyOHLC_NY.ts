import { getNYDateKey } from "./toNY";

export type IntradayRow = {
  timestamp_utc: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type OHLC = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const buildDailyOHLC_NY = (
  rows: IntradayRow[]
): OHLC[] => {
  if (!rows?.length) {
    throw new Error("No intraday rows");
  }

  const grouped: Record<string, IntradayRow[]> = {};

  for (const row of rows) {
    const key = getNYDateKey(row.timestamp_utc);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  // 🔥 日付を正しくソート
  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const result: OHLC[] = dates.map((date) => {
    const candles = grouped[date];

    candles.sort(
      (a, b) =>
        new Date(a.timestamp_utc).getTime() -
        new Date(b.timestamp_utc).getTime()
    );

    const open = candles[0].open;
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const close = candles[candles.length - 1].close;

    return {
      date,
      open,
      high,
      low,
      close,
    };
  });

  if (result.length < 2) {
    throw new Error("Not enough NY daily data");
  }

  return result;
};