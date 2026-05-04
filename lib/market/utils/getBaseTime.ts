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

  let adjusted = false;

  // 金曜以外なら前週へ
  if (day !== 5) {
    friday.setUTCDate(friday.getUTCDate() - 7);
    adjusted = true;
  }

  // 曜日名（見やすさ用）
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  log("FLOW", "WEEKLY CLOSE DECISION", {
    baseTime: end.toISOString(),
    baseDay: dayMap[day],
    numericDay: day,

    diffToFriday: diff,

    computedFriday: new Date(end.getTime() - diff * 86400000).toISOString(),

    adjustedToPrevWeek: adjusted,

    finalFriday: friday.toISOString(),
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