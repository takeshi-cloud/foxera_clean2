type OHLC = {
  timestamp_utc: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

// =========================================
// NY17:00起点 4Hバー生成
// TradingView FX 4H合わせ
// =========================================
export function build4HBars_NY(
  bars1h: OHLC[]
): OHLC[] {
  if (!bars1h.length) {
    throw new Error("No 1H bars");
  }

  const grouped: Record<string, OHLC[]> = {};

  for (const bar of bars1h) {
    const utc = new Date(bar.timestamp_utc);

    const hour = utc.getUTCHours();

    // NY17:00 = 21UTC(DST想定)
    const shiftedHour =
      (hour - 21 + 24) % 24;

    const bucket =
      Math.floor(shiftedHour / 4) * 4;

    const bucketHour =
      (bucket + 21) % 24;

    const bucketDate = new Date(utc);

    if (hour < 21) {
      bucketDate.setUTCDate(
        bucketDate.getUTCDate() - 1
      );
    }

    const key =
      bucketDate
        .toISOString()
        .slice(0, 10) +
      `T${String(bucketHour).padStart(
        2,
        "0"
      )}:00:00Z`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(bar);
  }

  return Object.entries(grouped)
    .map(([timestamp, bars]) => ({
      timestamp_utc: timestamp,
      open: bars[0].open,
      high: Math.max(
        ...bars.map((b) => b.high)
      ),
      low: Math.min(
        ...bars.map((b) => b.low)
      ),
      close: bars[bars.length - 1].close,
    }))
    .sort((a, b) =>
      a.timestamp_utc.localeCompare(
        b.timestamp_utc
      )
    );
}