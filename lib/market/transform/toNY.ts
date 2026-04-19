export const getNYDateKey = (utc: string): string => {
  if (!utc) {
    throw new Error("Invalid UTC input");
  }

  const date = new Date(utc);

  // NYローカル時間取得
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value])
  );

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);

  // NY基準日
  const nyDate = new Date(Date.UTC(year, month - 1, day));

  // 🔥 NYクローズ基準（17時）
  if (hour >= 17) {
    nyDate.setUTCDate(nyDate.getUTCDate() + 1);
  }

  return nyDate.toISOString().slice(0, 10);
};