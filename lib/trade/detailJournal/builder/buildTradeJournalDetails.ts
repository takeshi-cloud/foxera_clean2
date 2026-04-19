export function buildTradeJournalDetails(
  journal: any
) {
  const entryRaw =
    journal.entry_time ?? "";

  const exitRaw =
    journal.exit_time ?? "";

  return {
    symbol: journal.symbol ?? "",

    entryDate:
      entryRaw.split("T")[0] ?? "",

    entryTime:
      entryRaw
        .split("T")[1]
        ?.slice(0, 5) ?? "",

    exitDate:
      exitRaw.split("T")[0] ?? "",

    exitTime:
      exitRaw
        .split("T")[1]
        ?.slice(0, 5) ?? "",

    holdingTime:
      journal.holding_time ?? "",

    pair:
      journal.symbol ?? "",

    direction:
      journal.direction ??
      "LONG",

    result:
      journal.result ?? "",

    size: String(
      journal.size ?? ""
    ),

    pips: String(
      journal.profit_pips ?? ""
    ),

    profit: String(
      journal.profit ?? ""
    ),
  };
}