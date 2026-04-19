export function mergeData(
  data: any[],
  zigzagData: any[]
) {
  console.log("PRICE SAMPLE:", data[0]);
  console.log("ZIGZAG SAMPLE:", zigzagData[0]);

  return data.map((d) => {
    const zz = zigzagData.find(
      (z) => z.time === d.time
    );

    return {
      ...d,
      zigzag: zz ? zz.price : null,
    };
  });
}