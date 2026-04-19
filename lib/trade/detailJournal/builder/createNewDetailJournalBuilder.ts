export function createNewDetailJournalBuilder() {
  const today = new Date();

  const endDate =
    today.toISOString().slice(0, 10);

  const start = new Date();
  start.setDate(
    start.getDate() - 7
  );

  const startDate =
    start.toISOString().slice(0, 10);

  return {
    tradeInfo: {
      symbol: "",

      entryDate: "",
      entryTime: "",

      exitDate: "",
      exitTime: "",

      holdingTime: "",

      pair: "",
      direction: "LONG",

      result: "",
      size: "",
      pips: "",
      profit: "",
    },

    notes: [
      {
        title: "エントリー前分析",
        text: "",
      },
      {
        title: "エントリー根拠",
        text: "",
      },
      {
        title: "反省点",
        text: "",
      },
      {
        title: "改善点",
        text: "",
      },
    ],

    chartState: {
      symbol: "",
      tf: "1h",
      startDate,
      endDate,
      showLine: true,
      showZigzag: true,
      zigzagDeviation: 0.03,
      zigzagDepth: 3,
    },
  };
}