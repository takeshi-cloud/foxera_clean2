// lib/ma/utils/getBaseTime_MA.ts

type TF = "15m" | "1h" | "4h";

// =============================
// ① 時間足で丸め（UTC）
// =============================
function floorToTF(input: Date, tf: TF): Date {
  const msMap: Record<TF, number> = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
  };

  const tfMs = msMap[tf];
  const floored =
    Math.floor(input.getTime() / tfMs) * tfMs;

  return new Date(floored);
}

// =============================
// ② 週末除外（簡易版）
// =============================
function adjustWeekend(base: Date): Date {
  const day = base.getUTCDay(); // 0=日,5=金,6=土
  const hour = base.getUTCHours();

  const CLOSE_HOUR = 21; // DST無視（現段階）

  // 金曜クローズ後
  if (day === 5 && hour >= CLOSE_HOUR) {
    return new Date(
      Date.UTC(
        base.getUTCFullYear(),
        base.getUTCMonth(),
        base.getUTCDate(),
        CLOSE_HOUR - 1,
        0,
        0
      )
    );
  }

  // 土曜 → 金曜へ戻す
  if (day === 6) {
    return new Date(
      Date.UTC(
        base.getUTCFullYear(),
        base.getUTCMonth(),
        base.getUTCDate() - 1,
        CLOSE_HOUR - 1,
        0,
        0
      )
    );
  }

  // 日曜 → 金曜へ戻す
  if (day === 0) {
    return new Date(
      Date.UTC(
        base.getUTCFullYear(),
        base.getUTCMonth(),
        base.getUTCDate() - 2,
        CLOSE_HOUR - 1,
        0,
        0
      )
    );
  }

  return base;
}

// =============================
// ③ メイン
// =============================
export function getBaseTime_MA(
  input: Date,
  tf: TF
): Date {
  const floored = floorToTF(input, tf);
  const adjusted = adjustWeekend(floored);

  console.log("⏱ getBaseTime_MA", {
    input: input.toISOString(),
    tf,
    result: adjusted.toISOString(),
  });

  return adjusted;
}

// =============================
// ④ テスト（必要なら使う）
// =============================
// if (process.env.NODE_ENV !== "production") {
//   ...
// }