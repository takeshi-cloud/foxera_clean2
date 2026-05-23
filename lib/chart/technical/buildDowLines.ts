// /lib/technical/buildDowLines.ts

type Pivot = {
  price: number;
  type: "HIGH" | "LOW";
  time: string;
};

type DowLine = {
  id: number;

  type:
    | "trendBreakUp"
    | "trendBreakDown";

  price: number;
  time: string;

  fromIndex: number;
  breakIndex: number;

  endIndex?: number;
  endTime?: string;
  endReason?: string;
};

const REVERSE_LIMIT = 3;

export function buildDowLines(
  pivots: Pivot[]
): DowLine[] {
  const result: DowLine[] = [];

  // =========================
  // 起点生成
  // =========================

  for (
    let i = 0;
    i < pivots.length - 4;
    i++
  ) {
    const p1 = pivots[i];
    const p2 = pivots[i + 1];
    const p3 = pivots[i + 2];
    const p4 = pivots[i + 3];
    const p5 = pivots[i + 4];

    // =========================
    // 📉 下降 → 上抜け崩壊
    // =========================

    if (
      p1.type === "HIGH" &&
      p2.type === "LOW" &&
      p3.type === "HIGH" &&
      p4.type === "LOW" &&
      p5.type === "HIGH"
    ) {
      const lowerHigh =
        p3.price < p1.price;

      const lowerLow =
        p4.price < p2.price;

      const breakUp =
        p5.price > p3.price;

      if (
        lowerHigh &&
        lowerLow &&
        breakUp
      ) {
        result.push({
          id:
            result.length +
            1,

          type:
            "trendBreakUp",

          price:
            p4.price,

          fromIndex:
            i + 3,

          breakIndex:
            i + 4,

          time:
            p4.time,
        });
      }
    }

    // =========================
    // 📈 上昇 → 下抜け崩壊
    // =========================

    if (
      p1.type === "LOW" &&
      p2.type === "HIGH" &&
      p3.type === "LOW" &&
      p4.type === "HIGH" &&
      p5.type === "LOW"
    ) {
      const higherLow =
        p3.price > p1.price;

      const higherHigh =
        p4.price > p2.price;

      const breakDown =
        p5.price < p3.price;

      if (
        higherLow &&
        higherHigh &&
        breakDown
      ) {
        result.push({
          id:
            result.length +
            1,

          type:
            "trendBreakDown",

          price:
            p4.price,

          fromIndex:
            i + 3,

          breakIndex:
            i + 4,

          time:
            p4.time,
        });
      }
    }
  }

  // =========================
  // 終点ロジック
  // 逆行3本
  // =========================

  result.forEach(
    (line) => {
      let reverseCount = 0;

      for (
        let i =
          line.breakIndex +
          1;
        i <
        pivots.length;
        i++
      ) {
        const pivot =
          pivots[i];

        const isReverse =
          line.type ===
          "trendBreakUp"
            ? pivot.price <
              line.price
            : pivot.price >
              line.price;

        if (
          isReverse
        ) {
          reverseCount++;
        } else {
          reverseCount = 0;
        }

        if (
          reverseCount >=
          REVERSE_LIMIT
        ) {
          line.endIndex =
            i;

          line.endTime =
            pivot.time;

          line.endReason =
            "reverse3";

          break;
        }
      }
    }
  );

  return result;
}