// =========================================
// 🧠 mergeData（linePrice + zigzag統合）
// =========================================
export function mergeData(
  data: any[],
  zigzagData: any[]
) {
  console.log("LINE SAMPLE:", data[0]);
  console.log("ZIGZAG SAMPLE:", zigzagData[0]);

  // 🔥 事前にMap化（高速化）
  const zigzagMap = new Map(
    zigzagData.map((z) => [z.time, z])
  );

  return data.map((d) => {
    const zz = zigzagMap.get(d.time);

    return {
      ...d,

      // 👇 lineChartで作った値をそのまま使う
      linePrice: d.linePrice,

      // 👇 zigzag
      zigzag: zz ? zz.price : null,
    };
  });
}