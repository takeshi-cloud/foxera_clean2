import { getOrCreatePivot } from "@/lib/market/builders/pivoBuilder";
import { nyBarsBuilder } from "@/lib/market/builders/nyBarsBuilder";
import { getIntradayOHLC } from "@/lib/market/ingest/getIntradayOHLC";
import { getBaseTime } from "@/lib/market/utils/getBaseTime";
import { supabase } from "@/lib/infra/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const MARKET = "USD/JPY";
  const step = searchParams.get("step") || "all";

  const debug: any = {
    market: MARKET,
    step,
    baseTime: {},
    steps: {},
    errors: [],
  };

  console.log("🚀 DEBUG START:", MARKET, step);

  // =========================================
  // BASE TIME
  // =========================================
  try {
    const daily = getBaseTime("daily");
    const weekly = getBaseTime("weekly");

    debug.baseTime = {
      daily: {
        start: daily.start.toISOString(),
        end: daily.end.toISOString(),
      },
      weekly: {
        start: weekly.start.toISOString(),
        end: weekly.end.toISOString(),
      },
    };
  } catch (e: any) {
    debug.errors.push({
      step: "baseTime",
      error: e?.message || String(e),
    });
  }

  // =========================================
  // STEP 1: Intraday
  // =========================================
  if (step === "intraday" || step === "all") {
    try {
      const from = new Date("2024-01-01");
      const now = new Date();

      const intraday = await getIntradayOHLC(MARKET, from, now);

      debug.steps.intraday = {
        from: from.toISOString(),
        to: now.toISOString(),
        count: intraday?.length || 0,
        first: intraday?.[0] || null,
      };
    } catch (e: any) {
      debug.errors.push({
        step: "intraday",
        error: e?.message || String(e),
      });
    }

    try {
      const { data } = await supabase
        .from("ohlc_1h")
        .select("*")
        .eq("symbol", MARKET)
        .order("timestamp_utc", { ascending: false })
        .limit(5);

      debug.steps.db_latest = data;
    } catch (e: any) {
      debug.errors.push({
        step: "db_latest",
        error: e?.message || String(e),
      });
    }

    try {
      const fromISO = new Date("2024-01-01").toISOString();
      const toISO = new Date().toISOString();

      const { data } = await supabase
        .from("ohlc_1h")
        .select("*")
        .eq("symbol", MARKET)
        .gte("timestamp_utc", fromISO)
        .lte("timestamp_utc", toISO)
        .limit(5);

      debug.steps.db_range_test = {
        from: fromISO,
        to: toISO,
        count: data?.length || 0,
        sample: data?.[0] || null,
      };
    } catch (e: any) {
      debug.errors.push({
        step: "db_range_test",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // STEP 2: NY Bars
  // =========================================
  if (step === "ny" || step === "all") {
    try {
      const ny = await nyBarsBuilder(MARKET);
      debug.steps.nyBars = ny;
    } catch (e: any) {
      debug.errors.push({
        step: "nyBarsBuilder",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // STEP 3: Pivot
  // =========================================
  if (step === "pivot" || step === "all") {
    try {
      const pivot = await getOrCreatePivot(MARKET);
      debug.steps.pivot = pivot;
    } catch (e: any) {
      debug.errors.push({
        step: "pivot",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // STEP 4: fetchOHLC（最重要）
  // =========================================
  if (step === "ohlc" || step === "all") {
    try {
      const { fetchOHLC } = await import(
        "@/lib/market/ingest/fetchMarketData"
      );

      const result = await fetchOHLC("USD/JPY", "5m", {
        outputsize: 5,
      });

      debug.steps.fetchOHLC = {
        input: "USD/JPY",
        count: result?.length || 0,
        first: result?.[0] || null,
      };
    } catch (e: any) {
      debug.errors.push({
        step: "fetchOHLC",
        error: e?.message || String(e),
      });
    }
  }

  console.log("🏁 DEBUG END");

  return Response.json(debug);
}