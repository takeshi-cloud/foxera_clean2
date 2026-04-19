import { parseMT4Csv } from "../parser/parseMT4Csv";

import {
  duplicateCheck,
  saveTradeImports,
} from "../service/importService";

import { createTradeJournal } from "@/lib/trade/journal/service/tradeJournalService";

import { TradeImport } from "../types";

/* =========================================
   Run Import Preview
   ファイル解析 → 重複除外
========================================= */
export async function runTradeImport(
  userId: string,
  file: File
): Promise<TradeImport[]> {
  const parsed = await parseMT4Csv(file);

  const deduped = await duplicateCheck(
    userId,
    parsed
  );

  return deduped;
}

/* =========================================
   Save Imported Trades
   Import保存 → Journal生成
========================================= */
export async function saveImportedTrades(
  userId: string,
  trades: TradeImport[]
) {
  const imported = await saveTradeImports(
    userId,
    trades
  );

  if (!imported || imported.length === 0) {
    return [];
  }

  await createTradeJournal(
    userId,
    imported
  );

  return imported;
}