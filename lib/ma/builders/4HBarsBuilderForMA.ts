// lib/ma/builders/nyBarsBuilder_range.ts

type OHLC = {
  timestamp_utc: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

// =========================================
// 共通：昇順
// =========================================
const sortAsc = (bars: OHLC[]) =>
  [...bars].sort(
    (a, b) =>
      new Date(a.timestamp_utc).getTime() -
      new Date(b.timestamp_utc).getTime()
  );

// =========================================
// 土日除外（4Hで使う）
// =========================================
const removeWeekend = (bars: OHLC[]) =>
  bars.filter((b) => {
    const d = new Date(b.timestamp_utc).getUTCDay();
    return d !== 0 && d !== 6;
  });

const build4H_NY = (bars1h: OHLC[]) => {
  const grouped: Record<string, OHLC[]> = {};

  for (const bar of bars1h) {
    const utc = new Date(bar.timestamp_utc);

    // =========================================
    // NY日付（21:00基準）
    // =========================================
    const nyDate = new Date(utc);

    if (utc.getUTCHours() < 21) {
      nyDate.setUTCDate(nyDate.getUTCDate() - 1);
    }

    // =========================================
    // NY日開始（21:00）
    // =========================================
    const nyStart = new Date(
      Date.UTC(
        nyDate.getUTCFullYear(),
        nyDate.getUTCMonth(),
        nyDate.getUTCDate(),
        21,
        0,
        0
      )
    );

    // =========================================
    // 経過時間（ms）
    // =========================================
    const diff =
      utc.getTime() - nyStart.getTime();

    // =========================================
    // 4Hブロック番号
    // =========================================
    const block = Math.floor(
      diff / (4 * 60 * 60 * 1000)
    );

    // =========================================
    // 4H開始時刻
    // =========================================
    const bucketTime = new Date(
      nyStart.getTime() +
        block * 4 * 60 * 60 * 1000
    );

    const key = bucketTime.toISOString();

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(bar);
  }

  return Object.entries(grouped)
    .map(([timestamp, bars]) => ({
      timestamp_utc: timestamp,
      open: bars[0].open,
      high: Math.max(...bars.map((b) => b.high)),
      low: Math.min(...bars.map((b) => b.low)),
      close: bars[bars.length - 1].close,
    }))
    .sort((a, b) =>
      a.timestamp_utc.localeCompare(b.timestamp_utc)
    );
};

// =========================================
// メイン
// =========================================
export function build4HBarsForMA (
  bars1h: OHLC[],
  baseTime: Date,
  required: number
) {
  console.log("\n📦 NY 4H BUILDER START");

  // =============================
  // ① ソート（1Hはそのまま使う）
  // =============================
  let bars = sortAsc(bars1h);

  // =============================
  // ② baseTimeでカット（1H）
  // =============================
  bars = bars.filter(
    (b) =>
      new Date(b.timestamp_utc) <= baseTime
  );

  console.log("✂️ BASE CUT 1H", {
    last:
      bars[bars.length - 1]
        ?.timestamp_utc,
  });

  // =============================
  // ③ 4H生成（←ここは連続性維持）
  // =============================
  let bars4h = build4H_NY(bars);

  console.log("📊 4H BUILT", {
    count: bars4h.length,
    from:
      bars4h[0]?.timestamp_utc,
    to:
      bars4h[
        bars4h.length - 1
      ]?.timestamp_utc,
  });

  // =========================================
  // 🔥 DEBUG（必要ならON）
  // =========================================
  /*
  console.log("🧪 ALL 4H BARS");
  bars4h.forEach((b, i) => {
    console.log(i, {
      time: b.timestamp_utc,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    });
  });
  */

  // =============================
  // ④ baseTimeで再カット（4H）
  // =============================
  bars4h = bars4h.filter(
    (b) =>
      new Date(b.timestamp_utc) <= baseTime
  );

  // =============================
  // ⑤ 土日除外（ここでやる）
  // =============================
  //const before4h = bars4h.length;
  //bars4h = removeWeekend(bars4h);

  //console.log("🧹 WEEKEND REMOVED 4H", {
  //  before: before4h,
  //  after: bars4h.length,
  //});

  // =============================
  // ⑥ 必要本数だけ
  // =============================
  const result = bars4h.slice(-required);

  console.log("✅ FINAL 4H", {
    count: result.length,
    from:
      result[0]?.timestamp_utc,
    to:
      result[
        result.length - 1
      ]?.timestamp_utc,
  });

  return result;
}