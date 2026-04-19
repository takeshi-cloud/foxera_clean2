import Papa from "papaparse";

import { TradeImport } from "../../import/types";
import {
  calcProfitPips,
  judgeTradeResult,
} from "../../../trade/calculator/tradeCalc";
import { normalizeSymbol } from "../normalizer/normalizeSymbol";

export async function parseMT4Csv(
  file: File
): Promise<TradeImport[]> {
  const text = await file.text();

  // Detailed Statement形式判定
  if (text.includes("Closed Transactions:")) {
    return parseDetailedStatement(text);
  }

  // 通常CSV
  return parseStandardCsv(text);
}

/* =========================================
   Standard CSV
========================================= */
function parseStandardCsv(
  text: string
): Promise<TradeImport[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,

      complete(results) {
        try {
          resolve(buildTrades(results.data as any[]));
        } catch (err) {
          reject(err);
        }
      },

      error(err) {
        reject(err);
      },
    });
  });
}

/* =========================================
   Detailed Statement
========================================= */
function parseDetailedStatement(
  text: string
): TradeImport[] {
  const lines = text.split(/\r?\n/);

  const startIndex = lines.findIndex((l) =>
    l.includes("Closed Transactions:")
  );

  if (startIndex === -1) {
    throw new Error(
      "Closed Transactions not found"
    );
  }

  const headerIndex = startIndex + 1;

  const endIndex = lines.findIndex((l) =>
    l.startsWith("Closed P/L:")
  );

  const csvLines = lines.slice(
    headerIndex,
    endIndex
  );

  const parsed = Papa.parse(
    csvLines.join("\n"),
    {
      header: true,
      skipEmptyLines: true,
      delimiter: "\t",
    }
  );

  return buildTrades(parsed.data as any[]);
}

/* =========================================
   Build TradeImport[]
========================================= */
function buildTrades(
  rows: any[]
): TradeImport[] {
  return rows
    .filter(
      (row) =>
        row.Type !== "balance" &&
        row.Type !== "credit" &&
        row.Ticket &&
        row["Close Time"]
    )
    .map((row) => {
      const rawSymbol = String(
        row.Item
      ).trim();

      const symbol =
        normalizeSymbol(rawSymbol);

      const direction =
        row.Type === "buy"
          ? "LONG"
          : "SHORT";

 const entryPrice = toNumber(
  row.Price
);

const exitPrice = toNumber(
  row["Close Price"] ??
  row["Price_1"] ??
  row["Price"]
);

const profitPips =
  calcProfitPips({
    symbol,
    direction,
    entry: entryPrice,
    exit: exitPrice,
  });

      return {
        ticket: String(row.Ticket),

        rawSymbol,
        symbol,

        direction,

        openTime: row["Open Time"],
        closeTime: row["Close Time"],

        size: toNumber(row.Size),

        entryPrice,
        exitPrice,

        commission: toNumber(
          row.Commission
        ),
        taxes: toNumber(row.Taxes),
        swap: toNumber(row.Swap),

        profit: toNumber(row.Profit),

        profitPips,

        result:
          judgeTradeResult(
            profitPips
          ),

        rawJson: row,
      };
    });
}

/* =========================================
   Number Cleaner
========================================= */
function toNumber(
  value: any
): number {
  if (!value) return 0;

  return Number(
    String(value).replace(
      /[\s,]/g,
      ""
    )
  );
}