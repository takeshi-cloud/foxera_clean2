import { supabase } from "@/lib/infra/supabase";
import { fetchAndSave } from "./fetchAndSave";

export const getIntradayOHLC = async (
  symbol: string,
  from: Date,
  to: Date
) => {

  const log = (type: string, step: string, data?: any) => {
    console.log(`[intraday][${type}] ${step}`, data ?? "");
  };

  log("FLOW", "START", { symbol });

  if (!symbol) {
    throw new Error("❌ symbol undefined in getIntradayOHLC");
  }

  const dbSymbol = symbol;

  const fromISO = from.toISOString();
  const toISO = to.toISOString();

  log("DATA", "REQUEST RANGE", {
    from: fromISO,
    to: toISO,
  });

  // =========================================
  // DB取得
  // =========================================
  let { data } = await supabase
    .from("ohlc_1h")
    .select("*")
    .eq("symbol", dbSymbol)
    .gte("timestamp_utc", fromISO)
    .lte("timestamp_utc", toISO)
    .order("timestamp_utc", { ascending: true });

  log("DATA", "DB RESULT", {
    count: data?.length || 0,
  });

  const latest = data?.[data.length - 1];

  // =========================================
  // fetch判定
  // =========================================

  let needFetch = false;

  if (!data?.length) {
    log("FLOW", "NO DATA → FETCH");
    needFetch = true;
  } else if (latest) {
    const latestTime = new Date(latest.timestamp_utc);
    const diff = to.getTime() - latestTime.getTime();

    if (diff > 60 * 60 * 1000) {
      log("FLOW", "DATA OLD → FETCH", {
        diffMin: diff / 60000,
      });
      needFetch = true;
    }
  }

  if (needFetch) {
    log("FLOW", "FETCH START");

    await fetchAndSave(
      symbol,
      "1h",
      fromISO.slice(0, 10),
      toISO.slice(0, 10)
    );

    let retry = 0;

    while (retry < 5) {
      const res = await supabase
        .from("ohlc_1h")
        .select("*")
        .eq("symbol", dbSymbol)
        .gte("timestamp_utc", fromISO)
        .lte("timestamp_utc", toISO)
        .order("timestamp_utc", { ascending: true });

      log("FLOW", "RETRY", {
        retry,
        count: res.data?.length || 0,
      });

      if (res.data?.length) {
        data = res.data;
        break;
      }

      await new Promise((r) => setTimeout(r, 500));
      retry++;
    }
  } else {
    log("FLOW", "FETCH SKIPPED");
  }

  // =========================================
  // fallback
  // =========================================
  if (!data?.length) {
    log("ERROR", "FALLBACK TRIGGERED");

    const res = await supabase
      .from("ohlc_1h")
      .select("*")
      .eq("symbol", dbSymbol)
      .order("timestamp_utc", { ascending: false })
      .limit(50);

    if (res.data?.length) {
      return res.data.reverse();
    }

    throw new Error("No intraday data");
  }

  // =========================================
  // 🔥 最重要：データ品質チェック
  // =========================================

  const first = data[0];
  const last = data[data.length - 1];

  const spanHours =
    (new Date(last.timestamp_utc).getTime() -
      new Date(first.timestamp_utc).getTime()) /
    (1000 * 60 * 60);

  log("DATA", "FINAL DATA RANGE", {
    start: first.timestamp_utc,
    end: last.timestamp_utc,
    count: data.length,
    spanHours,
  });

  // 🔥 ギャップチェック（軽量）
  let gaps = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = new Date(data[i - 1].timestamp_utc).getTime();
    const curr = new Date(data[i].timestamp_utc).getTime();

    if (curr - prev > 60 * 60 * 1000 + 1000) {
      gaps++;
    }
  }

  log("DATA", "GAP CHECK", {
    gaps,
  });

  log("FLOW", "RETURN");

  return data;
};