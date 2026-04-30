import { fetchOHLC } from "./fetchMarketData";
import { saveMarketData } from "../../market/storage/saveMarketData";
import { supabase } from "@/lib/infra/supabase";

export async function fetchAndSave(
  symbol: string,
  timeframe: string,
  from?: string,
  to?: string,
  outputsize: number = 500
) {
  console.log("🚀 START:", {
    symbol,
    timeframe,
    from,
    to,
    outputsize,
  });

  if (!symbol) {
    throw new Error("❌ symbol undefined in fetchAndSave");
  }

  const now = new Date();

  // =========================================
  // ① 無駄fetch防止（5m）
  // =========================================
  if (timeframe === "5m") {
    const { data } = await supabase
      .from("ohlc_5m")
      .select("timestamp_utc")
      .eq("symbol", symbol)
      .order("timestamp_utc", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.timestamp_utc) {
      const last = new Date(data.timestamp_utc);
      const diffMin =
        (now.getTime() - last.getTime()) / 60000;

      if (diffMin >= 0 && diffMin < 3) {
        console.log("⏭ skip fetch (fresh)");
        return;
      }
    }
  }

  // =========================================
  // ② TF変換
  // =========================================
  const intervalMap: Record<string, string> = {
    "5m": "5min",
    "15m": "15min",
  };

  const apiTimeframe =
    intervalMap[timeframe] || timeframe;

  // =========================================
  // ③ 取得範囲
  // =========================================
 let start = from;
let end = to;

if (from && to) {
  const OFFSET_MS = 10 * 60 * 60 * 1000;

  const startBase = new Date(from);
  const endBase = new Date(to);

  // 既存ロジック
  startBase.setDate(startBase.getDate() - 2);

 

  // 🔥 ここが核心（+10h）
 const apiStart = new Date(startBase);
apiStart.setUTCHours(21, 0, 0, 0);
apiStart.setTime(apiStart.getTime() + OFFSET_MS);
  const apiEnd = new Date(endBase);
apiEnd.setUTCHours(21, 0, 0, 0);

// そこから +10h
apiEnd.setTime(apiEnd.getTime() + OFFSET_MS);

 start = apiStart.toISOString();
end   = apiEnd.toISOString();
}

 console.log("📅 fetch mode:", {
  type: "latest",
  outputsize,
});

console.log("📡 FETCH REQUEST", {
  requestedFrom: from,
  requestedTo: to,
  adjustedFrom: start,
  adjustedTo: end,
});


 // =========================================
// ④ API取得
// =========================================
let data;

try {
  // 🔥 何を取りに行ってるか（意図）
  console.log("📡 FETCH REQUEST", {
    symbol,
    timeframe,
    requestedFrom: from,
    requestedTo: to,
    adjustedFrom: start,
    adjustedTo: end,
    outputsize,
  });

 data = await fetchOHLC(symbol, apiTimeframe, {
  from: start,
  to: end,
  outputsize,
});

  // 既存ログ（そのまま残す）
  console.log("🔥 FETCH COUNT:", data?.length);
  console.log("🔥 FETCH LAST:", data?.[data.length - 1]);

  // 🔥 実際に取れた範囲
  console.log("📡 FETCH RANGE", {
    first: data?.[0]?.timestamp_utc,
    last: data?.[data.length - 1]?.timestamp_utc,
    count: data?.length,
  });

  console.log("📡 FETCH RANGE", {
  first: data?.[0]?.timestamp_utc,
  last: data?.[data.length - 1]?.timestamp_utc,
});
  // 🔥 リクエストとの差分
  console.log("📡 REQUEST vs RESULT", {
    requestedFrom: from,
    requestedTo: to,
    actualFrom: data?.[0]?.timestamp_utc,
    actualTo: data?.[data.length - 1]?.timestamp_utc,
  });

} catch (e) {
  console.error("❌ fetchOHLC failed:", e);
  return;
}

if (!data?.length) {
  console.warn("⚠️ no data fetched:", {
    symbol,
    timeframe,
  });
  return;
}

// =========================================
// 🔥 異常値フィルタ（ここに追加）
// =========================================
const clean = data.filter((curr: any, i: number) => {
  if (!curr) return false;

  // 数値化
  const high = Number(curr.high);
  const low = Number(curr.low);
  const close = Number(curr.close);

  if (!high || !low || !close) return false;

  // ① 明らかなバグ
  if (low <= 0) return false;

  // ② 前足比較
  if (i === 0) return true;

  const prev = data[i - 1];
  const prevClose = Number(prev.close);

  if (!prevClose) return false;

  const ratioHigh = high / prevClose;
  const ratioLow  = low  / prevClose;

  // ±20%以上は異常
  if (ratioHigh > 1.2 || ratioLow < 0.8) {
    console.warn("⚠️ 異常値除外", {
      time: curr.timestamp_utc,
      high,
      low,
      prevClose,
    });
    return false;
  }

  return true;
});

data = clean;








  // =========================================
  // ⑤ テーブル
  // =========================================
  const tableMap: Record<string, string> = {
    "5m": "ohlc_5m",
    "15m": "ohlc_15m",
    "1h": "ohlc_1h",
    "4h": "ohlc_4h",
  };

  const table = tableMap[timeframe];

  if (!table) {
    console.error("❌ Unsupported timeframe:", timeframe);
    return;
  }

  // =========================================
  // ⑥ 正規化
  // =========================================
 const OFFSET_MS = -10 * 60 * 60 * 1000;

const formatted = data
  .map((d: any) => {
    if (!d.timestamp_utc) return null;

    const raw = new Date(d.timestamp_utc);
    if (isNaN(raw.getTime())) return null;

    const corrected = new Date(raw.getTime() + OFFSET_MS);

    return {
      symbol,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),

      // 🔥 追加
      timestamp_raw: raw.toISOString(),

      // 🔥 ここを差し替え
      timestamp_utc: corrected.toISOString(),
    };
  })
  .filter(Boolean);

  if (!formatted.length) {
    console.warn("❌ no valid rows after format");
    return;
  }
console.log("💾 SAVE COUNT:", formatted.length);
console.log("💾 SAVE LAST:", formatted[formatted.length - 1]);
  // =========================================
  // ⑦ 保存
  // =========================================
  try {
    await saveMarketData(table, formatted);
    console.log("✅ saved:", table, symbol);
  } catch (e) {
    console.error("❌ save failed:", symbol, e);
  }

  console.log("🔥 FETCH LAST:", data[data.length - 1]);
console.log("💾 SAVE LAST:", formatted[formatted.length - 1]);
}


