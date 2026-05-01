type Input = {
  price: number;

  ma15: number;

  ma1h_now: number;
  ma1h_prev: number;

  ma4h_now: number;
  ma4h_prev: number;

  structure_order: string[];
};
export function analyzeMASignal({
  price,
  ma15,
  ma1h_now,
  ma1h_prev,
  ma4h_now,
  ma4h_prev,
  structure_order,
}: Input) {
  let direction: "UP" | "DOWN" | "OTHER" = "OTHER";
  let phase: "TREND" | "PULLBACK" | null = null;

  // =========================
  // ■ 方向（スロープ）
  // =========================
  const up4h = ma4h_now > ma4h_prev;
  const up1h = ma1h_now > ma1h_prev;

  const down4h = ma4h_now < ma4h_prev;
  const down1h = ma1h_now < ma1h_prev;

  if (up4h && up1h) {
    direction = "UP";
  } else if (down4h && down1h) {
    direction = "DOWN";
  }

  // =========================
  // ■ PHASE
  // =========================
  if (direction === "UP") {
    phase = price > ma15 ? "TREND" : "PULLBACK";
  }

  if (direction === "DOWN") {
    phase = price < ma15 ? "TREND" : "PULLBACK";
  }

  // =========================
  // ■ ⭐
  // =========================
  const rank = structure_order.indexOf("PRICE");
let stars = 0;

if (direction === "UP") {
  // 下にあるほど強い
  stars = rank + 1;
} else if (direction === "DOWN") {
  // 上にあるほど強い
  stars = 4 - rank;
} else {
  stars = 0;
}

stars = Math.max(1, Math.min(4, stars));

  return {
    direction,
    phase,
    stars,
  };
}