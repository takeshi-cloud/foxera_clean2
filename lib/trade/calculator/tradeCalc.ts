import { PIP_CONFIG } from "./pipConfig";

type CalcArgs = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entry: number;
  exit: number;
};

/* =========================
   Pip Unit Resolver
========================= */
function getPipUnit(
  symbol: string
): number {
  const clean = symbol
    .toUpperCase()
    .replace("/", "");

  // Exact Match (Index / CFD)
  if (clean in PIP_CONFIG) {
    return PIP_CONFIG[
      clean as keyof typeof PIP_CONFIG
    ];
  }

  // Gold / Silver
  if (clean.includes("XAU")) {
    return PIP_CONFIG.XAU;
  }

  if (clean.includes("XAG")) {
    return PIP_CONFIG.XAG;
  }

  // JPY Pair
  if (clean.endsWith("JPY")) {
    return PIP_CONFIG.JPY;
  }

  return PIP_CONFIG.DEFAULT;
}

/* =========================
   Profit Pips
========================= */
export function calcProfitPips({
  symbol,
  direction,
  entry,
  exit,
}: CalcArgs): number {
  const diff =
    direction === "LONG"
      ? exit - entry
      : entry - exit;

  const pipUnit =
    getPipUnit(symbol);

  return Number(
    (diff / pipUnit).toFixed(1)
  );
}

/* =========================
   Result Judge
========================= */
export function judgeTradeResult(
  profitPips: number,
  evenThreshold = 5
): "WIN" | "LOSS" | "EVEN" {
  if (
    profitPips >= -evenThreshold &&
    profitPips <= evenThreshold
  ) {
    return "EVEN";
  }

  return profitPips > 0
    ? "WIN"
    : "LOSS";
}