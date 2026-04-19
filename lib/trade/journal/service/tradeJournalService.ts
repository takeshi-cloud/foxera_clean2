import { supabase } from "@/lib/infra/supabase";
import { markTradeImportsAsJournalized } from "@/lib/trade/import/service/importService";

/* =========================================
   Hold Time Calc
========================================= */
function calcHoldTime(
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

  const minutes = totalMin % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

/* =========================================
   Create Trade Journal
========================================= */
export async function createTradeJournal(
  userId: string,
  importedTrades: any[]
) {
  const payload = importedTrades.map(
    (trade) => ({
      user_id: userId,
      import_id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      entry_time: trade.open_time,
      exit_time: trade.close_time,

      holding_time: calcHoldTime(
        trade.open_time,
        trade.close_time
      ),

      result: trade.result,
      profit: trade.profit,
      profit_pips: trade.profit_pips,
      size: trade.size ?? null,

      analyzed: true,
    })
  );

  const { error } =
    await supabase
      .from("trade_journal")
      .insert(payload);

  if (error) {
    console.error(
      "createTradeJournal error:",
      error
    );
    throw error;
  }

  await markTradeImportsAsJournalized(
    importedTrades.map(
      (t) => t.id
    )
  );
}

/* =========================================
   Get Trade Journal
========================================= */
export async function getTradeJournal(
  journalId: string
) {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .select("*")
      .eq("id", journalId)
      .single();

  if (error) throw error;

  return data;
}

/* =========================================
   Update Trade Journal
========================================= */
export async function updateTradeJournal(
  journalId: string,
  payload: any
) {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .update(payload)
      .eq("id", journalId)
      .select()
      .single();

  if (error) {
    console.error(
      "updateTradeJournal error:",
      error
    );
    throw error;
  }

  return data;
}

/* =========================================
   Clear Detail Journal
   (メモ / チャート設定のみ削除)
========================================= */
export async function clearTradeJournalDetails(
  journalId: string
) {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .update({
        entry_analysis: "",
        entry_reason: "",
        reflection: "",
        improvement: "",

        chart_state: "none",
        chart_state_json: {},
      })
      .eq("id", journalId)
      .select()
      .single();

  if (error) {
    console.error(
      "clearTradeJournalDetails error:",
      error
    );
    throw error;
  }

  return data;
}

/* =========================================
   List Trade Journals
========================================= */
export async function listTradeJournals() {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .select("*")
      .order("entry_time", {
        ascending: false,
      });

  if (error) throw error;

  return (data || []).map((j) => ({
    ...j,
    analyzed:
      j.analyzed ?? true,
  }));
}

/* =========================================
   Delete Trade Journal
   (レコード削除)
========================================= */
export async function deleteTradeJournal(
  journalId: string
) {
  const { error } =
    await supabase
      .from("trade_journal")
      .delete()
      .eq("id", journalId);

  if (error) throw error;
}

/* =========================================
   Toggle Analyzed
========================================= */
export async function toggleTradeJournalAnalyzed(
  journalId: string,
  value: boolean
) {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .update({
        analyzed: value,
      })
      .eq("id", journalId)
      .select()
      .single();

  if (error) throw error;

  return data;
}

export async function createManualTradeJournal(
  payload: any
) {
  const { data, error } =
    await supabase
      .from("trade_journal")
      .insert(payload)
      .select()
      .single();

  if (error) {
    console.error(
      "createManualTradeJournal error:",
      error
    );
    throw error;
  }

  return data;
}