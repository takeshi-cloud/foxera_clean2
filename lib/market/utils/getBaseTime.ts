type Timeframe = "daily" | "weekly";

const log = (type: string, step: string, data?: any) => {
  console.log(`[baseTime][${type}] ${step}`, data ?? "");
};

// =========================================
// NYクローズ
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
// DAILY
// =========================================
function getLastDailyClose(base = new Date()) {
  const end = getNYCloseUTC(base);
  const day = end.getUTCDay();

  if (day === 6) {
    end.setUTCDate(end.getUTCDate() - 1);
  }

  if (day === 0) {
    end.setUTCDate(end.getUTCDate() - 2);
  }

  log("DATA", "DAILY CLOSE", {
    time: end.toISOString(),
    day,
  });

  return end;
}

// =========================================
// WEEKLY
// =========================================
function getLastWeeklyClose(base = new Date()) {
  const end = getLastDailyClose(base);
  const day = end.getUTCDay();

  const diff = day - 5;

  const friday = new Date(end);
  friday.setUTCDate(end.getUTCDate() - diff);

  // 🔥 ここだけ追加
  friday.setUTCDate(friday.getUTCDate() - 7);

  log("DATA", "WEEKLY CLOSE", {
    base: end.toISOString(),
    friday: friday.toISOString(),
    day,
    diff,
  });

  return friday;
}
// =========================================
// MAIN
// =========================================
export function getBaseTime(timeframe: Timeframe) {

  if (timeframe === "daily") {
    const end = getLastDailyClose();

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 1);

    log("RESULT", "DAILY RANGE", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return { start, end };
  }

  if (timeframe === "weekly") {
    const end = getLastWeeklyClose();

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 5);

    log("RESULT", "WEEKLY RANGE", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return { start, end };
  }

  throw new Error("invalid timeframe");
}