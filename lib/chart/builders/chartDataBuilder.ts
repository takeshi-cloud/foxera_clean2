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
  // 異常値補正（★追加ロジック）
  // =========================================
 const sanitizeBars = (rows) => {
  if (!rows || rows.length === 0) return rows;

  const result = [];

  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i];

    const open = Number(cur.open);
    const high = Number(cur.high);
    const low = Number(cur.low);
    const close = Number(cur.close);

    const prev = result[i - 1];

    if (!prev) {
      result.push(cur);
      continue;
    }

    const prevClose = Number(prev.close);

    // ★ここが本質修正
    const isInvalid =
      !open ||
      !high ||
      !low ||
      !close ||
      low <= 0 ||
      high < low ||
      close > high ||
      close < low ||
      Math.abs(close - prevClose) / prevClose > 0.2;

    if (isInvalid) {
      console.warn("⚠️ FIX", {
        time: cur.timestamp_utc,
        open,
        high,
        low,
        close,
      });

      result.push({
        ...cur,
        open: prevClose,
        high: prevClose,
        low: prevClose,
        close: prevClose,
      });

      continue;
    }

    result.push({
      ...cur,
      open,
      high,
      low,
      close,
    });
  }

  return result;
};

  // =========================================
  // 再取得
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

  console.log("📊 final chart rows:", rows?.length);

  // ★ここだけ変更（最重要）
  const cleaned = sanitizeBars(rows);
  console.log(
  "LOW CHECK",
  cleaned.find(r => r.low === 0)
);
  return buildChartSeries(cleaned);
};