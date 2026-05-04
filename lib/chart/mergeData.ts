export function mergeData(
  data: any[],
  zigzagData: any[]
) {
  console.log("LINE SAMPLE:", data[0]);
  console.log("ZIGZAG SAMPLE:", zigzagData[0]);

  const zigzagMap = new Map(
    zigzagData.map((z) => [z.time, z])
  );

  return data.map((d, i) => {
    const zz = zigzagMap.get(d.time);

    return {
      ...d,

      idx: i, // 🔥これ追加（最重要）

      linePrice: d.linePrice,
      zigzag: zz ? zz.price : null,
    };
  });
}