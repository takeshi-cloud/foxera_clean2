import { getDailyOHLC } from "./getDailyOHLC";

export const getWeeklyOHLC = async (pair: string, date: string) => {
  // =========================================
  // 🔥 日付フォーマット強制
  // =========================================
  if (!date || typeof date !== "string") {
    throw new Error("Invalid date input");
  }

  // ISO来ても強制変換
  const safeDate = date.slice(0, 10);

  const base = new Date(safeDate + "T00:00:00.000Z");

  if (isNaN(base.getTime())) {
    throw new Error("Invalid date parse: " + date);
  }

  // =========================================
  // 🔥 月曜計算（UTC）
  // =========================================
  const day = base.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() + diff);

  const days: any[] = [];

  // =========================================
  // 🔥 月〜金取得
  // =========================================
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);

    const dayStr = d.toISOString().slice(0, 10);

    try {
      const ohlc = await getDailyOHLC(pair, dayStr);
      days.push(ohlc);
    } catch {
      console.log("skip:", dayStr);
    }
  }

  if (days.length < 3) {
    throw new Error("Not enough weekly data");
  }

  // =========================================
  // 🔥 UTCソート
  // =========================================
  days.sort(
    (a, b) =>
      new Date(a.timestamp_utc).getTime() -
      new Date(b.timestamp_utc).getTime()
  );

  const latest = days[days.length - 1];

  console.log("📅 weekly latest:", latest.timestamp_utc);

  return days;
};