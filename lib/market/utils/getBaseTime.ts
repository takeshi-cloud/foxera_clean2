type Timeframe = "daily" | "weekly";

// =========================================
// NYクローズ（17:00 NY = 21:00 UTC）
// =========================================
function getNYCloseUTC(base = new Date()) {
  const d = new Date(base);

  const close = new Date(d);
  close.setUTCHours(21, 0, 0, 0);

  if (d.getTime() < close.getTime()) {
    close.setUTCDate(close.getUTCDate() - 1);
  }

  return close;
}

// =========================================
// 基準時間（FX仕様：日曜スタート）
// =========================================
export function getBaseTime(timeframe: Timeframe) {
  const end = getNYCloseUTC();

  // =====================
  // DAILY
  // =====================
  if (timeframe === "daily") {
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 1);

    return { start, end };
  }

  // =====================
  // WEEKLY（🔥これが正解）
  // =====================
  if (timeframe === "weekly") {
    const d = new Date(end);

    const day = d.getUTCDay(); // 0=日

    // 🔥 日曜に戻す
    const sunday = new Date(d);
    sunday.setUTCDate(d.getUTCDate() - day);
    sunday.setUTCHours(21, 0, 0, 0);

    const start = sunday;

    const weekEnd = new Date(start);
    weekEnd.setUTCDate(start.getUTCDate() + 5); // 金曜

    return {
      start,
      end: weekEnd,
    };
  }

  throw new Error("invalid timeframe");
}