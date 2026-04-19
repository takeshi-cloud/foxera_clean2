import { NextResponse } from "next/server";
import { supabase } from "@/lib/infra/supabase";
import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";
import { MARKETS } from "@/lib/constants/markets";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pair } = body;

    console.log("🚀 CORE PRICE API:", pair);

    // =========================================
    // 🔥 MARKET統一（label → key）
    // =========================================
    const market = MARKETS.find((m) => m.label === pair);
    if (!market) {
      throw new Error(`Market not found: ${pair}`);
    }

    const dbSymbol = market.key;
    const now = new Date();

    // =========================================
    // ① DBから最新取得
    // =========================================
    let { data } = await supabase
      .from("ohlc_5m")
      .select("close, timestamp_utc")
      .eq("pair", dbSymbol)
      .order("timestamp_utc", { ascending: false })
      .limit(1);

    let needFetch = true;

    if (data && data.length >= 1) {
      const latestTime = new Date(data[0].timestamp_utc);

      const diffMin =
        (now.getTime() - latestTime.getTime()) / 60000;

      console.log("⏱ diffMin:", diffMin);

      if (diffMin >= 0 && diffMin < 5) {
        needFetch = false;
      }
    }

    // =========================================
    // ② 必要なら更新（1本だけ取得）
    // =========================================
    if (needFetch) {
      console.log("🔄 fetching latest 5m (1 bar)");

      const start = new Date();
      start.setUTCDate(start.getUTCDate() - 1);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = now.toISOString().slice(0, 10);

      // 👇 ここ固定（重要）
      await fetchAndSave(pair, "5m", startStr, endStr, 1);
    }

    // =========================================
    // ③ 最新取得
    // =========================================
    const { data: fresh } = await supabase
      .from("ohlc_5m")
      .select("close, timestamp_utc")
      .eq("pair", dbSymbol)
      .order("timestamp_utc", { ascending: false })
      .limit(1);

    if (!fresh || fresh.length < 1) {
      throw new Error("No 5m data");
    }

    const latest = fresh[0];

    const price = Number(latest.close);

    if (!price || isNaN(price)) {
      throw new Error("Invalid price");
    }

    console.log("💰 PRICE:", price);

    return NextResponse.json({
      ok: true,
      pair,
      price,
      timestamp: latest.timestamp_utc,
    });

  } catch (e) {
    console.error("🔥 CORE API ERROR:", e);

    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}