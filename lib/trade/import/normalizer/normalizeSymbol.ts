export function normalizeSymbol(
  raw: string
): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  /* =========================
     Metals / Commodities
  ========================= */
  if (cleaned.includes("XAUUSD"))
    return "XAU/USD";

  if (cleaned.includes("XAGUSD"))
    return "XAG/USD";

  if (cleaned.includes("WTI"))
    return "WTI";

  if (cleaned.includes("BRENT"))
    return "BRENT";

  /* =========================
     Index / CFD
  ========================= */
  if (
    cleaned.includes("US100") ||
    cleaned.includes("NAS100") ||
    cleaned.includes("USTEC")
  )
    return "US100";

  if (
    cleaned.includes("US30") ||
    cleaned.includes("DJI")
  )
    return "US30";

  if (
    cleaned.includes("SPX500") ||
    cleaned.includes("US500") ||
    cleaned.includes("SP500")
  )
    return "SPX500";

  if (
    cleaned.includes("GER40") ||
    cleaned.includes("DE40") ||
    cleaned.includes("DAX")
  )
    return "GER40";

  if (
    cleaned.includes("JP225") ||
    cleaned.includes("JPN225") ||
    cleaned.includes("NIKKEI")
  )
    return "JP225";

  /* =========================
     Forex Generic 6-letter
  ========================= */
  const forexMatch = cleaned.match(
    /([A-Z]{6})/
  );

  if (forexMatch) {
    const pair = forexMatch[1];

    return `${pair.slice(
      0,
      3
    )}/${pair.slice(3, 6)}`;
  }

  /* =========================
     Fallback
  ========================= */
  return cleaned;
}