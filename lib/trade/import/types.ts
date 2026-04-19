export type TradeImport = {
  ticket: string;

  rawSymbol: string;
  symbol: string;

  direction: "LONG" | "SHORT";

  openTime: string;
  closeTime: string;

  size: number;

  entryPrice: number;
  exitPrice: number;

  commission: number;
  taxes: number;
  swap: number;

  profit: number;
  profitPips: number;

  result: "WIN" | "LOSS" | "EVEN";
  hasJournal?: boolean;

  rawJson: any;
};