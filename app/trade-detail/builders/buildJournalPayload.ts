type Params = {
  tradeInfo: any;
  notes: any[];
  chartState: any;
};

export function buildJournalPayload({
  tradeInfo,
  notes,
  chartState,
}: Params) {
  return {
    symbol: tradeInfo.symbol,

    entry_time:
      tradeInfo.entryDate &&
      tradeInfo.entryTime
        ? `${tradeInfo.entryDate}T${tradeInfo.entryTime}:00`
        : null,

    exit_time:
      tradeInfo.exitDate &&
      tradeInfo.exitTime
        ? `${tradeInfo.exitDate}T${tradeInfo.exitTime}:00`
        : null,

    holding_time: tradeInfo.holdingTime,

    direction: tradeInfo.direction,

    result: tradeInfo.result,

    size:
      tradeInfo.size === ""
        ? null
        : Number(tradeInfo.size),

    profit_pips:
      tradeInfo.pips === ""
        ? null
        : Number(tradeInfo.pips),

    profit:
      tradeInfo.profit === ""
        ? null
        : Number(tradeInfo.profit),

    entry_analysis: notes[0]?.text ?? "",
    entry_reason: notes[1]?.text ?? "",
    reflection: notes[2]?.text ?? "",
    improvement: notes[3]?.text ?? "",

    chart_state: "saved",
    chart_state_json: chartState ?? {},
  };
}