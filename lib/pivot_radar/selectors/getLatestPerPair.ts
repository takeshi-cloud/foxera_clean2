export const getLatestPerPair = (rows: any[]) => {
  const map = new Map<string, any>();

  for (const r of rows) {
    if (!r?.symbol) {
  console.warn("❌ missing symbol:", r);
  continue;
}

    const key = r.symbol;

    const existing = map.get(key);

    const t1 = r.timestamp
      ? new Date(r.timestamp).getTime()
      : 0;

    const t2 = existing?.timestamp
      ? new Date(existing.timestamp).getTime()
      : 0;

    if (!existing || t1 > t2) {
      map.set(key, r);
    }
  }

  return Array.from(map.values());
};