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
  .map(([timestamp, bars]) => {
    // 🔥 4本揃ってない4Hは捨てる
    if (bars.length < 4) return null;

    return {
      timestamp_utc: timestamp,
      open: bars[0].open,
      high: Math.max(...bars.map((b) => b.high)),
      low: Math.min(...bars.map((b) => b.low)),
      close: bars[bars.length - 1].close,
    };
  })
  .filter((b): b is OHLC => b !== null)
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
// ① ソート（1Hは絶対に削らない）
// =============================
let bars = sortAsc(bars1h);

console.log("🧪 1H INPUT CHECK", {
  count: bars.length,
  first: bars[0]?.timestamp_utc,
  last: bars[bars.length - 1]?.timestamp_utc,
});

// =============================
// ② ❌ ここで1Hをカットしない
// 理由：4Hは「1H×4本」で成立するため
// 途中で削ると4Hが壊れる
// =============================

// （削除済み）
// bars = bars.filter(...)

// =============================
// ③ 4H生成（ここで初めて構造を作る）
// =============================
let bars4h = build4H_NY(bars);

console.log("📊 4H BUILT (RAW)", {
  count: bars4h.length,
  from: bars4h[0]?.timestamp_utc,
  to: bars4h[bars4h.length - 1]?.timestamp_utc,
});

// =============================
// ④ baseTimeで未確定4Hだけ除外
// 理由：未来データ（未完成足）だけ落とす
// =============================
bars4h = bars4h.filter(
  (b) => new Date(b.timestamp_utc) <= baseTime
);

console.log("✂️ AFTER BASE CUT 4H", {
  count: bars4h.length,
  last: bars4h[bars4h.length - 1]?.timestamp_utc,
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
// ⑥ ここでは切らない（MA側でやる）
// =============================
return bars4h;
}