export const buildChartSeries = (rows: any[]) => {
  const filtered = rows.filter((candle) => {
    const day = new Date(
      candle.timestamp_utc
    ).getUTCDay();

    return day !== 0 && day !== 6;
  });

  return filtered.map((candle, index) => {
    const isUp = candle.close > candle.open;

    return {
      idx: index,
      time: candle.timestamp_utc,
      price: isUp
        ? candle.high
        : candle.low,
    };
  });
};