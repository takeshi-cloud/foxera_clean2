// /lib/technical/buildDowLines.ts

type Pivot = {
  price: number;
  type: "HIGH" | "LOW";
    time: string; // 🔥追加
};

type DowLine = {
  type: "trendBreakUp" | "trendBreakDown";
  price: number;
   time: string; // 🔥追加

  fromIndex: number;   // ← ④（ライン位置）
  breakIndex: number;  // ← ⑤（ブレイク）
};

export function buildDowLines(pivots: Pivot[]): DowLine[] {
  const result: DowLine[] = [];

  for (let i = 0; i < pivots.length - 4; i++) {
    const p1 = pivots[i];
    const p2 = pivots[i + 1];
    const p3 = pivots[i + 2];
    const p4 = pivots[i + 3];
    const p5 = pivots[i + 4];

    // =========================
    // 📉 下降トレンド → 上抜け崩壊
    // =========================
    if (
      p1.type === "HIGH" &&
      p2.type === "LOW" &&
      p3.type === "HIGH" &&
      p4.type === "LOW" &&
      p5.type === "HIGH"
    ) {
      const lowerHigh = p3.price < p1.price;
      const lowerLow = p4.price < p2.price;
      const breakUp = p5.price > p3.price;

      if (lowerHigh && lowerLow && breakUp) {
        result.push({
          type: "trendBreakUp",

          // 🔥 核心（④に線）
          price: p4.price,

          fromIndex: i + 3,   // ← ④
          breakIndex: i + 4,  // ← ⑤
            time: p4.time, // 🔥これ追加
        });
      }
    }

    // =========================
    // 📈 上昇トレンド → 下抜け崩壊
    // =========================
    if (
      p1.type === "LOW" &&
      p2.type === "HIGH" &&
      p3.type === "LOW" &&
      p4.type === "HIGH" &&
      p5.type === "LOW"
    ) {
      const higherLow = p3.price > p1.price;
      const higherHigh = p4.price > p2.price;
      const breakDown = p5.price < p3.price;

      if (higherLow && higherHigh && breakDown) {
        result.push({
          type: "trendBreakDown",
          price: p4.price,
          fromIndex: i + 3,
          breakIndex: i + 4,
            time: p4.time, // 🔥これ追加
        });
      }
    }
  }

  return result;
}