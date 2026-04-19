export const getLatestDateData = (rows: any[]) => {
  if (!rows.length) return [];

  const latestTime = Math.max(
    ...rows.map((r) => new Date(r.timestamp).getTime())
  );

  const latestDate = new Date(latestTime)
    .toISOString()
    .slice(0, 10);

  return rows.filter(
    (r) =>
      new Date(r.timestamp).toISOString().slice(0, 10) === latestDate
  );
};