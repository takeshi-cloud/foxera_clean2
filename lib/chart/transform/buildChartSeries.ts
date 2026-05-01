export const buildChartSeries = (rows: any[]) => {
  // ★まず元データチェック
  console.log(
    "RAW ZERO CHECK",
    rows.find(r => r.low === 0 || r.high === 0)
  );

  const filtered = rows.filter((candle) => {
    const day = new Date(
      candle.timestamp_utc
    ).getUTCDay();

    return day !== 0 && day !== 6;
  });

  // ★フィルタ後チェック
  console.log(
    "FILTERED ZERO CHECK",
    filtered.find(r => r.low === 0 || r.high === 0)
  );

  const mapped = filtered.map((candle, index) => {
    const isUp = candle.close > candle.open;

    const price =
      candle.low === 0
        ? candle.close
        : isUp
        ? candle.high
        : candle.low;

    return {
      idx: index,
      time: candle.timestamp_utc,
      price,
    };
  });

  // ★最終チェック（ここが一番重要）
  console.log(
    "FINAL ZERO PRICE",
    mapped.find(m => m.price === 0)
  );

  return mapped;
};