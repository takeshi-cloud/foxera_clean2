export const buildScatterData = (rows: any[]) => {
  const map = new Map();

  for (const r of rows) {
    const key = r.symbol; // 🔥 修正

    const existing = map.get(key);

    if (!existing || new Date(r.timestamp) > new Date(existing.timestamp)) {
      map.set(key, r);
    }
  }

  return Array.from(map.values()).map((r) => ({
    pair: r.symbol, // 🔥 修正
    x: r.x,
    y: r.y,
    timestamp: r.timestamp,
  }));
};