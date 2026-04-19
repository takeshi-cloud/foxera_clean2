import { getNearestPivot } from "./pivotCalc";

// --- 位置（-3〜+3） ---
export function getPivotPosition(price: number, pivots: any) {
  if (
    !pivots ||
    [pivots.S1, pivots.PP, pivots.R1].some(
      (v) => v == null
    )
  ) {
    return null; // ← スキップだけ
  }

  const { S3, S2, S1, PP, R1, R2, R3 } = pivots;

  // 🔥 計算は純粋に戻す
  const safeDiv = (a: number, b: number) => a / b;

  let pos = 0;

  if (price >= R2 && R3 !== R2) {
    pos = 2 + safeDiv(price - R2, R3 - R2);
  } else if (price >= R1 && R2 !== R1) {
    pos = 1 + safeDiv(price - R1, R2 - R1);
  } else if (price >= PP && R1 !== PP) {
    pos = safeDiv(price - PP, R1 - PP);
  } else if (price >= S1 && PP !== S1) {
    pos = -safeDiv(PP - price, PP - S1);
  } else if (price >= S2 && S1 !== S2) {
    pos = -1 - safeDiv(S1 - price, S1 - S2);
  } else if (S2 !== S3) {
    pos = -2 - safeDiv(S2 - price, S2 - S3);
  } else {
    return null; // ← ここでだけ弾く
  }

  if (pos > 4) pos = 4;
  if (pos < -4) pos = -4;

  return pos;
}

// --- メイン ---
export const calcRadar = (pivot: any, priceData: any) => {
  const price =
    typeof priceData === "number"
      ? priceData
      : priceData?.close ?? priceData?.price;

  // 🔥 修正
  if (price == null || isNaN(price)) {
    console.error("❌ Invalid priceData");
    return null;
  }

  if (!pivot?.daily || !pivot?.weekly) {
    console.error("❌ Missing pivot", pivot);
    return null;
  }

  const dailyPosition = getPivotPosition(price, pivot.daily);
  const weeklyPosition = getPivotPosition(price, pivot.weekly);

  // 🔥 完全スキップやめる
  if (dailyPosition == null || weeklyPosition == null) {
    console.warn("⚠️ partial pivot");

    return {
      price,
      daily: dailyPosition
        ? { position: dailyPosition }
        : null,
      weekly: weeklyPosition
        ? { position: weeklyPosition }
        : null,
    };
  }

  const dailyNearest = getNearestPivot(price, pivot.daily);
  const weeklyNearest = getNearestPivot(price, pivot.weekly);

  return {
    price,
    daily: {
      level: dailyNearest.level,
      value: dailyNearest.value,
      distance: dailyNearest.distance,
      position: dailyPosition,
    },
    weekly: {
      level: weeklyNearest.level,
      value: weeklyNearest.value,
      distance: weeklyNearest.distance,
      position: weeklyPosition,
    },
  };
};