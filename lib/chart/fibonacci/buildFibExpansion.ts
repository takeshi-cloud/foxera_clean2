// ========================================
// 🔥 Fibonacci Expansion Builder
// ========================================

export type ZigZagPoint = {
  idx: number;

  time: string;

  price: number;

  type:
    | "HIGH"
    | "LOW";
};

export type FibPattern =
  | "LOW-HIGH-LOW"
  | "HIGH-LOW-HIGH"
  | null;

export type FibResult = {
  valid: boolean;
  pattern: FibPattern;

  a?: ZigZagPoint;
  b?: ZigZagPoint;
  c?: ZigZagPoint;

  levels: number[];
};

const FIB_LEVELS = [
  0.618,
  1,
  1.618,
  2.618,
  3.618,
  4.618,
];

// ========================================
// 🚀 Main
// ========================================
export const buildFibExpansion = (
  zigzagPoints: ZigZagPoint[],
  startIndex: number
): FibResult => {
  const a =
    zigzagPoints[startIndex];

  const b =
    zigzagPoints[startIndex + 1];

  const c =
    zigzagPoints[startIndex + 2];

  // =====================================
  // データ不足
  // =====================================
  if (!a || !b || !c) {
    return {
      valid: false,
      pattern: null,
      levels: [],
    };
  }

  
  console.log(
    "🟡 FIB CHECK",
    {
      a,
      b,
      c,
    }
  );

  console.log(
  "🔥 A",
  a.idx,
  a.type,
  a.price
);

console.log(
  "🔥 B",
  b.idx,
  b.type,
  b.price
);

console.log(
  "🔥 C",
  c.idx,
  c.type,
  c.price
);
  

  // =====================================
  // Pattern1
  // LOW → HIGH → LOW
  // Higher Low
  // =====================================
  if (
    a.type === "LOW" &&
    b.type === "HIGH" &&
    c.type === "LOW"
  ) {
    const valid =
      c.price > a.price;

    if (!valid) {
      return {
        valid: false,
        pattern:
          "LOW-HIGH-LOW",
        a,
        b,
        c,
        levels: [],
      };
    }

    const range =
      b.price - a.price;

    const levels =
      FIB_LEVELS.map(
        (fib) =>
          c.price +
          range * fib
      );

    return {
      valid: true,
      pattern:
        "LOW-HIGH-LOW",
      a,
      b,
      c,
      levels,
    };
  }

  // =====================================
  // Pattern2
  // HIGH → LOW → HIGH
  // Lower High
  // =====================================
  if (
    a.type === "HIGH" &&
    b.type === "LOW" &&
    c.type === "HIGH"
  ) {
    const valid =
      c.price < a.price;

    if (!valid) {
      return {
        valid: false,
        pattern:
          "HIGH-LOW-HIGH",
        a,
        b,
        c,
        levels: [],
      };
    }

    const range =
      a.price - b.price;

    const levels =
      FIB_LEVELS.map(
        (fib) =>
          c.price -
          range * fib
      );

    return {
      valid: true,
      pattern:
        "HIGH-LOW-HIGH",
      a,
      b,
      c,
      levels,
    };
  }


  
  // =====================================
  // 成立せず
  // =====================================
  return {
    valid: false,
    pattern: null,
    a,
    b,
    c,
    levels: [],
  };
};