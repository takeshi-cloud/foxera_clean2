export type PivotResult = {
  PP: number;
  R1: number;
  R2: number;
  R3: number;
  S1: number;
  S2: number;
  S3: number;
};

// =========================================
// Pivot計算
// =========================================
export function calcPivot(
  high: number,
  low: number,
  close: number,
  type: "normal" | "fibo" = "normal"
): PivotResult {
  if (
    [high, low, close].some(
      (v) => typeof v !== "number" || isNaN(v)
    )
  ) {
    throw new Error("Invalid OHLC input");
  }

  const pp = (high + low + close) / 3;
  const diff = Math.max(high - low, 1e-8);

  if (type === "normal") {
    return {
      PP: pp,
      R1: 2 * pp - low,
      S1: 2 * pp - high,
      R2: pp + diff,
      S2: pp - diff,
      R3: high + 2 * (pp - low),
      S3: low - 2 * (high - pp),
    };
  }

  return {
    PP: pp,
    R1: pp + diff * 0.382,
    S1: pp - diff * 0.382,
    R2: pp + diff * 0.618,
    S2: pp - diff * 0.618,
    R3: pp + diff * 1.0,
    S3: pp - diff * 1.0,
  };
}

// =========================================
// 最寄りPivot
// =========================================
export function getNearestPivot(
  price: number,
  pivots: Record<string, number>
) {
  const keys = ["S3","S2","S1","PP","R1","R2","R3"];

  let nearestKey = "";
  let nearestValue = 0;
  let minDiff = Infinity;

  for (const key of keys) {
    const value = pivots[key];
    if (value == null) continue;

    const diff = Math.abs(price - value);

    if (diff < minDiff) {
      minDiff = diff;
      nearestKey = key;
      nearestValue = value;
    }
  }

  return {
    level: nearestKey,
    value: nearestValue,
    distance: price - nearestValue,
  };
}