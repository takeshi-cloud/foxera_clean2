export function buildOHLCFromRange(
  rows: any[],
  start: Date,
  end: Date
) {
  const filtered = rows.filter((r) => {
    const t = new Date(r.timestamp_utc).getTime();
    return t >= start.getTime() && t < end.getTime();
  });

  // =========================================
  // 🔥 データなし対応（重要）
  // =========================================
  if (!filtered.length) {
    console.warn("⚠️ No OHLC rows in range", {
      start,
      end,
    });
    return null; // ← throwやめる
  }

  filtered.sort(
    (a, b) =>
      new Date(a.timestamp_utc).getTime() -
      new Date(b.timestamp_utc).getTime()
  );

  return {
    open: Number(filtered[0].open),
    high: Math.max(...filtered.map((r) => Number(r.high))),
    low: Math.min(...filtered.map((r) => Number(r.low))),
    close: Number(filtered[filtered.length - 1].close),
  };
}