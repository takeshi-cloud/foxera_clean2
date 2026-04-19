import { supabase } from "@/lib/infra/supabase";
import { TradeImport } from "../types";

/* =========================================
   Duplicate Check
========================================= */
function normalizeDateKey(dateStr: string) {
  return new Date(dateStr)
    .toISOString()
    .slice(0, 19);
}

export async function duplicateCheck(
  userId: string,
  trades: TradeImport[]
) {
  const tickets = trades.map((t) => t.ticket);

  const { data, error } = await supabase
    .from("trade_imports")
    .select("ticket, close_time")
    .eq("user_id", userId)
    .in("ticket", tickets);

  if (error) throw error;

  const existingSet = new Set(
    data.map(
      (d) =>
        `${d.ticket}_${normalizeDateKey(
          d.close_time
        )}`
    )
  );

  return trades.filter((trade) => {
    const key = `${trade.ticket}_${normalizeDateKey(
      trade.closeTime
    )}`;

    return !existingSet.has(key);
  });
}

/* =========================================
   Save Trade Imports
========================================= */
export async function saveTradeImports(
  userId: string,
  trades: TradeImport[]
) {
  const payload = trades.map((trade) => ({
    user_id: userId,

    ticket: trade.ticket,

    raw_symbol: trade.rawSymbol,
    symbol: trade.symbol,

    direction: trade.direction,

    open_time: trade.openTime,
    close_time: trade.closeTime,

    size: trade.size,

    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,

    commission: trade.commission,
    taxes: trade.taxes,
    swap: trade.swap,

    profit: trade.profit,
    profit_pips: trade.profitPips,

    result: trade.result,

    raw_json: trade.rawJson,
  }));

  const { data, error } = await supabase
    .from("trade_imports")
    .insert(payload)
    .select();

  if (error) throw error;

  return data;
}

export async function markTradeImportsAsJournalized(
  importIds: string[]
) {
  const { error } =
    await supabase
      .from("trade_imports")
      .update({
        has_journal: true,
      })
      .in("id", importIds);

  if (error) {
    console.error(
      "markTradeImportsAsJournalized error:",
      error
    );
    throw error;
  }
}