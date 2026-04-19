import { getChartOHLC } from "../ingest/getChartOHLC";
import { buildChartSeries } from "../transform/buildChartSeries";
import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";

export const chartDataBuilder = async (
  symbol: string,
  tf: string,
  start: string,
  end: string
) => {
  let rows = await getChartOHLC(
    symbol,
    tf,
    start,
    end
  );

  // =========================================
  // 完全未取得
  // =========================================
  if (!rows || rows.length === 0) {
    console.log("⚠️ no chart data → full fetch");

    await fetchAndSave(symbol, tf, start, end);

    rows = await getChartOHLC(
      symbol,
      tf,
      start,
      end
    );

    return buildChartSeries(rows);
  }

  // =========================================
  // 部分不足判定
  // =========================================
  const first = rows[0];
  const last = rows[rows.length - 1];

  const firstDate = first.timestamp_utc.slice(0, 10);
  const lastDate = last.timestamp_utc.slice(0, 10);

  // 先頭不足
  if (firstDate > start) {
    console.log(
      "⚠️ missing head:",
      start,
      "→",
      firstDate
    );

    await fetchAndSave(
      symbol,
      tf,
      start,
      firstDate
    );
  }

  // 末尾不足
  if (lastDate < end) {
    console.log(
      "⚠️ missing tail:",
      lastDate,
      "→",
      end
    );

    await fetchAndSave(
      symbol,
      tf,
      lastDate,
      end
    );
  }

  // =========================================
  // 再取得
  // =========================================
  rows = await getChartOHLC(
    symbol,
    tf,
    start,
    end
  );

  console.log(
    "📊 final chart rows:",
    rows.length
  );

  return buildChartSeries(rows);
};