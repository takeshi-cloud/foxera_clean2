type Timeframe = "daily" | "weekly";

// =========================================
// NYクローズ（17:00 NY = 21:00 UTC）
// =========================================
function getNYCloseUTC(base = new Date()) {
  const d = new Date(base);

  const close = new Date(d);
  close.setUTCHours(21, 0, 0, 0);

  // まだ当日クローズしてない場合 → 前日にずらす
  if (d.getTime() < close.getTime()) {
    close.setUTCDate(close.getUTCDate() - 1);
  }

  return close;
}

// =========================================
// 最後の営業日クローズ取得（🔥土日スキップ）
// =========================================
function getLastDailyClose(base = new Date()) {
  const end = getNYCloseUTC(base);
  const day = end.getUTCDay(); // 0=日,6=土

  // 土曜 → 金曜
  if (day === 6) {
    end.setUTCDate(end.getUTCDate() - 1);
  }

  // 日曜 → 金曜
  if (day === 0) {
    end.setUTCDate(end.getUTCDate() - 2);
  }

  return end;
}

// =========================================
// 最後に確定した週の金曜クローズ
// =========================================
function getLastWeeklyClose(base = new Date()) {
  const end = getLastDailyClose(base);
  const day = end.getUTCDay(); // 0-6

  // 金曜(5)との差分
  const diff = day - 5;

  const friday = new Date(end);
  friday.setUTCDate(end.getUTCDate() - diff);

  return friday;
}

// =========================================
// 基準時間（FX仕様：確定足ベース）
// =========================================
export function getBaseTime(timeframe: Timeframe) {

  // =====================
  // DAILY（最後の確定1日）
  // =====================
  if (timeframe === "daily") {
    const end = getLastDailyClose();

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 1);

    return { start, end };
  }

  // =====================
  // WEEKLY（最後に確定した週）
  // =====================
  if (timeframe === "weekly") {
    const end = getLastWeeklyClose();

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 5); // 日曜21:00

    return { start, end };
  }

  throw new Error("invalid timeframe");
}