type SortMAStructureInput = {
  price: number;
  ma15: number;
  ma1h: number;
  ma4h: number;
};

// =========================================
// PRICE / MAs を価格順に並び替え
// 高い順で返す
// =========================================
export function sortMAStructure({
  price,
  ma15,
  ma1h,
  ma4h,
}: SortMAStructureInput): string[] {
  return [
    { key: "PRICE", value: price },
    { key: "15M", value: ma15 },
    { key: "1H", value: ma1h },
    { key: "4H", value: ma4h },
  ]
    .sort((a, b) => b.value - a.value)
    .map((item) => item.key);
}