// =========================================
// 🟦 高値/安値切替ライン
// =========================================
export function calcLineChart(data: any[]) {
  if (!data || data.length === 0) return [];

  return data.map((d, i) => {
    const next = data[i + 1];

    let linePrice = d.close;

    if (next) {
      if (next.close > d.close) {
        linePrice = d.low;   // 上昇 → 安値
      } else if (next.close < d.close) {
        linePrice = d.high;  // 下降 → 高値
      }
    }

    return {
      ...d,
      linePrice,
    };
  });
}


// =========================================
// 🟩 終値ライン（未使用・保持）
// =========================================
export function calcCloseLineChart(data: any[]) {
  if (!data || data.length === 0) return [];

  return data.map((d) => {
    return {
      ...d,
      linePrice: d.close,
    };
  });
}