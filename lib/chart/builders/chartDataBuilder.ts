import { getChartOHLC } from "../../market/ingest/getChartOHLC";
import { buildChartSeries } from "../transform/buildChartSeries";
import { fetchAndSave_range } from "../../market/ingest/fetchAndSave_range";

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

    await fetchAndSave_range(symbol, tf, start, end);

    // 🔥 修正：即取得やめて retry
    let retry = 0;
    while (retry < 5) {
      rows = await getChartOHLC(
        symbol,
        tf,
        start,
        end
      );

      console.log("🔁 retry(full)", retry, rows?.length);

      if (rows && rows.length > 0) break;

      await new Promise((r) => setTimeout(r, 200));
      retry++;
    }

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

    await fetchAndSave_range(
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

    await fetchAndSave_range(
      symbol,
      tf,
      lastDate,
      end
    );
  }

  // =========================================
  // 再取得（ここも同じ修正）
  // =========================================
  let retry = 0;

  while (retry < 5) {
    rows = await getChartOHLC(
      symbol,
      tf,
      start,
      end
    );

    console.log("🔁 retry(final)", retry, rows?.length);

    if (rows && rows.length > 0) break;

    await new Promise((r) => setTimeout(r, 200));
    retry++;
  }

  console.log(
    "📊 final chart rows:",
    rows?.length
  );

  return buildChartSeries(rows);
};