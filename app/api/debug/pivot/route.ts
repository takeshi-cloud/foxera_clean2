export const dynamic = "force-dynamic";

import { getPivot } from "@/lib/market/ingest/getPivot";
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
  // ① BASE TIME
  // =========================================
  let daily: any, weekly: any;

  try {
    daily = getBaseTime("daily");
    weekly = getBaseTime("weekly");

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
  // ② FETCH RANGE
  // =========================================
  let fetchFrom: Date | null = null;
  let fetchTo: Date | null = null;

  if (daily && weekly) {
    fetchFrom = new Date(weekly.start);
    fetchFrom.setUTCDate(fetchFrom.getUTCDate() - 5);

    fetchTo = daily.end;

    debug.steps.fetchRange = {
      from: fetchFrom.toISOString(),
      to: fetchTo.toISOString(),
    };
  }

  // =========================================
  // ③ INTRADAY
  // =========================================
  let intraday: any[] = [];

  if (
    (step === "intraday" || step === "all" || step === "flow") &&
    fetchFrom &&
    fetchTo
  ) {
    try {
      intraday = await getIntradayOHLC(MARKET, fetchFrom, fetchTo);

      debug.steps.intraday = {
        count: intraday.length,
        first: intraday[0] || null,
        last: intraday[intraday.length - 1] || null,
      };
    } catch (e: any) {
      debug.errors.push({
        step: "intraday",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // DB確認
  // =========================================
  if (step === "intraday" || step === "all") {
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
  }

  // =========================================
  // 🔥 API RAW CHECK（←ここが今回の本命）
  // =========================================
  if (step === "api" || step === "all") {
    try {
      const { fetchOHLC } = await import(
        "@/lib/market/ingest/fetchMarketData"
      );

      const raw = await fetchOHLC(MARKET, "1h", {
        outputsize: 5,
      });

      debug.steps.api_raw = raw?.[0] || null;

    } catch (e: any) {
      debug.errors.push({
        step: "api_raw",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // ④ NY BARS
  // =========================================
  let ny: any = null;

  if (step === "ny" || step === "all" || step === "flow") {
    try {
      ny = await nyBarsBuilder(MARKET);

      debug.steps.nyBars = ny;
    } catch (e: any) {
      debug.errors.push({
        step: "nyBarsBuilder",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // ⑤ PIVOT
  // =========================================
  let pivot: any = null;

  if (step === "pivot" || step === "all" || step === "flow") {
    try {
      pivot = await getPivot(MARKET);

      debug.steps.pivot = pivot;
    } catch (e: any) {
      debug.errors.push({
        step: "pivot",
        error: e?.message || String(e),
      });
    }
  }

  // =========================================
  // ⑥ FLOW
  // =========================================
  if (step === "flow" || step === "all") {
    try {
      debug.steps.flow = {
        baseTime: debug.baseTime,
        fetchRange: debug.steps.fetchRange,
        intraday: debug.steps.intraday,
        nyBars: ny,
        pivot: pivot,
      };
    } catch (e: any) {
      debug.errors.push({
        step: "flow",
        error: e?.message || String(e),
      });
    }
  }

  console.log("🏁 DEBUG END");

  return Response.json(debug);
}