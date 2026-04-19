export const toScatterData = (rows: any[]) => {
  return rows.map((r) => ({
    pair: r.symbol, // 🔥 修正
    x: r.x,
    y: r.y,
    timestamp: r.timestamp,
  }));
};