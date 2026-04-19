export type TradeJournal = {
  id: string;

  symbol: string;
  direction: string;
  result: string;
  holding_time?: string;
  profit: number;
  profit_pips: number;

  size?: number;

  analyzed?: boolean;

  entry_time: string;
  exit_time: string;
  chart_state?: string;
  chart_state_json?: any;
};