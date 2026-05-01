type Input = {
  price: number;
  ma15: number;
  ma1h: number;
  ma4h: number;
  structure_order: string[];
};

export function analyzeMASignal({
  price,
  ma15,
  ma1h,
  ma4h,
  structure_order,
}: Input) {
  let direction: "UP" | "DOWN" | "OTHER" = "OTHER";
  let phase: "TREND" | "PULLBACK" | null = null;

  // ■ 方向
  if (ma4h > price && ma1h > price) {
    direction = "UP";
  } else if (ma4h < price && ma1h < price) {
    direction = "DOWN";
  }

  // ■ PHASE
  if (direction === "UP") {
    phase = price > ma15 ? "TREND" : "PULLBACK";
  }

  if (direction === "DOWN") {
    phase = price < ma15 ? "TREND" : "PULLBACK";
  }

  // ■ ⭐
  const rank = structure_order.indexOf("PRICE");
  const stars = 4 - rank;

  return {
    direction,
    phase,
    stars,
  };
}