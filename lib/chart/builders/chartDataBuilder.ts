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

  const sanitizeBars = (rows) => {
  if (!rows || rows.length === 0) return rows;

  console.log("=== SANITIZE START ===");

  // =========================================
  // ① ソート前チェック
  // =========================================
  console.log(
    "ORDER BEFORE",
    rows.slice(0, 5).map(r => r.timestamp_utc)
  );

  // =========================================
  // ② ソート（検証用に強制）
  // =========================================
  rows.sort(
    (a, b) =>
      new Date(a.timestamp_utc).getTime() -
      new Date(b.timestamp_utc).getTime()
  );

  console.log(
    "ORDER AFTER",
    rows.slice(0, 5).map(r => r.timestamp_utc)
  );

  const result = [];

  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i];

    const open = Number(cur.open);
    const high = Number(cur.high);
    const low = Number(cur.low);
    const close = Number(cur.close);

    // ❌ 今のコード
    const prev_bug = result[i - 1];

    // ✅ 正しいprev
    const prev = result[result.length - 1];

    // =========================================
    // ③ prev比較ログ（核心）
    // =========================================
    if (i < 5) {
      console.log("PREV CHECK", {
        i,
        prev_bug: prev_bug?.close,
        prev_correct: prev?.close,
      });
    }

    // 初回
    if (!prev) {
      result.push({
        ...cur,
        open,
        high,
        low,
        close,
      });
      continue;
    }

    const prevClose = Number(prev.close);

    const diff = Math.abs(close - prevClose) / prevClose;

    const isInvalid =
      !open ||
      !high ||
      !low ||
      !close ||
      low <= 0 ||
      high < low ||
      close > high ||
      close < low ||
      diff > 0.2;

     // =========================================
    // ④ 異常検知ログ
    // =========================================
    if (diff > 0.2) {
      console.log("🚨 DIFF DETECTED", {
        time: cur.timestamp_utc,
        prevClose,
        close,
        diff,
      });
    }

    const prevHigh = Number(prev.high);
    const prevLow = Number(prev.low);

    // 🔥 個別チェック
    const highInvalid =
      !high || Math.abs(high - prevClose) / prevClose > 0.2;

    const lowInvalid =
      !low || Math.abs(low - prevClose) / prevClose > 0.2;

    const closeInvalid =
      !close || Math.abs(close - prevClose) / prevClose > 0.2;

    const fixedHigh = highInvalid ? prevHigh : high;
    const fixedLow = lowInvalid ? prevLow : low;
    const fixedClose = closeInvalid ? prevClose : close;

    if (highInvalid || lowInvalid || closeInvalid) {
      console.warn("⚠️ PARTIAL FIX", {
        time: cur.timestamp_utc,
        high,
        low,
        close,
        fixedHigh,
        fixedLow,
        fixedClose,
      });
    }

    result.push({
      ...cur,
      open: open || prevClose,
      high: fixedHigh,
      low: fixedLow,
      close: fixedClose,
    });
  }

  // =========================================
  // ⑤ 最終チェック（奈落検出）
  // =========================================
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1];
    const cur = result[i];

    const diff =
      Math.abs(cur.close - prev.close) / prev.close;

    if (diff > 0.2) {
      console.error("❌ STILL BROKEN AFTER SANITIZE", {
        time: cur.timestamp_utc,
        prev: prev.close,
        cur: cur.close,
        diff,
      });
    }
  }

  console.log("=== SANITIZE END ===");

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