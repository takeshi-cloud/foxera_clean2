import { TradeJournal } from "../types";

export type DisplayJournal =
  TradeJournal & {
    entryLabel: string;
    exitLabel: string;
    holdLabel: string;
    profitLabel: string;
  };

/* =========================================
   Fallback Hold Time Calc
   ※旧データ用（holding_time未保存時）
========================================= */
function formatHoldTime(
  entry: string,
  exit: string
): string {
  const diffMs =
    new Date(exit).getTime() -
    new Date(entry).getTime();

  const totalMin = Math.floor(
    diffMs / 60000
  );

  const days = Math.floor(
    totalMin / 1440
  );

  const hours = Math.floor(
    (totalMin % 1440) / 60
  );

  const minutes =
    totalMin % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

/* =========================================
   Build Display Journal
========================================= */
export function buildTradeJournalDisplay(
  journals: TradeJournal[]
): DisplayJournal[] {
  return journals.map((j) => ({
    ...j,

    entryLabel: new Date(
      j.entry_time
    ).toLocaleString(),

    exitLabel: new Date(
      j.exit_time
    ).toLocaleString(),

    holdLabel:
      j.holding_time ||
      formatHoldTime(
        j.entry_time,
        j.exit_time
      ),

    profitLabel: Number(
      j.profit
    ).toLocaleString(),
  }));
}