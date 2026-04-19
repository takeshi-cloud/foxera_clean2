export type DetailJournalPageData = {
  tradeInfo: {
    symbol: string;
    date: string;
    entryTime: string;
    holding_time?: string;
    result: string;
    profit: string;
    pips: string;
    size: string;
    direction: string;
  };

  notes: {
    title: string;
    text: string;
  }[];

  chartState: {
    symbol: string;
    tf: string;
    startDate: string;
    endDate: string;
    showLine: boolean;
    showZigzag: boolean;
    zigzagDeviation: number;
    zigzagDepth: number;
  };
};