export const dynamic = "force-dynamic";
import { runOnePair } from "@/lib/market/builders/runOnePair";
import { MARKETS } from "@/lib/constants/markets";
import { supabase } from "@/lib/infra/supabase";

export async function GET(req: Request) {
  const log = (step: string, data?: any) => {
    console.log(`[RADAR API] ${step}`, data ?? "");
  };

  const { searchParams } = new URL(req.url);
  const marketParam = searchParams.get("market");
  const force = searchParams.get("force") === "true";

  // =========================================
  // 対象マーケット
  // =========================================
  const targets = marketParam
    ? MARKETS.filter((m) => m.api === marketParam)
    : MARKETS;

  log("START", {
    count: targets.length,
    force,
  });

  try {
    // =========================================
    // ① 既存データ取得（cache判定）
    // =========================================
    const { data: latestRows } = await supabase
      .from("pivot_radar_history")
      .select("symbol, price_timestamp")
      .in(
        "symbol",
        targets.map((m) => m.api)
      );

    const cacheMap = new Map(
      (latestRows || []).map((r) => [r.symbol, r])
    );

    // =========================================
    // ② 直列実行（ここだけ変更）
    // =========================================
    const results: any[] = [];

    for (const m of targets) {
      const cache = cacheMap.get(m.api);

      let skip = false;

      if (!force && cache?.price_timestamp) {
        const diffMin =
          (Date.now() - new Date(cache.price_timestamp).getTime()) /
          60000;

        if (diffMin < 5) {
          skip = true;
        }
      }

      // =====================================
      // SKIP（ここが重要）
      // =====================================
      if (skip) {
        log("SKIP CACHE", m.api);

        const { data: latest } = await supabase
          .from("pivot_radar_history")
          .select("*")
          .eq("symbol", m.api)
          .order("timestamp", { ascending: false })
          .limit(1)
          .maybeSingle();

        results.push({
          label: m.label,
          symbol: m.api,
          key: m.key,
          step: "cache",
          summary: latest
            ? {
                now: {
                  utc: latest.timestamp,
                  tokyo: latest.timestamp,
                },
                price: {
                  value: latest.price,
                  time: latest.price_timestamp,
                },
                radar: {
                  x: latest.x,
                  y: latest.y,
                  time: latest.timestamp,
                },
              }
            : null,
          error: null,
        });

        continue;
      }

      // =====================================
      // 実行
      // =====================================
      log("RUN", m.api);

      const result = await runOnePair(m.api);

      log("DONE", {
        market: m.api,
        step: result?.step,
      });

      results.push({
        label: m.label,
        symbol: m.api,
        key: m.key,
        step: result?.step,
        summary: result?.summary,
        trace: result?.trace,
        error: result?.error || null,
      });
    }

    log("END");

    return Response.json({
      success: true,
      count: results.length,
      results,
    });

  } catch (e: any) {
    console.error("[RADAR API] FATAL", e);

    return Response.json(
      {
        success: false,
        error: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}