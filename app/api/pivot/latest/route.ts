export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/infra/supabase";

export async function GET() {
  try {
    console.log("📡 GET latest radar");

    // =========================================
    // 🔥 ① DBで「正しい最新」を取得
    // =========================================
    const { data: latestKey, error } = await supabase
      .from("pivot_radar_history")
      .select("source_daily_date, source_week_start")
      .order("source_daily_date", {
        ascending: false,
      })
      .order("source_week_start", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // =========================================
    // 🔥 latestなし
    // =========================================
    if (!latestKey) {
      return NextResponse.json(
        {
          source_daily_date: null,
          source_week_start: null,
          timestamp: null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // =========================================
    // 🔥 ② そのPivotの最新1件
    // =========================================
    const { data: latestRow } = await supabase
      .from("pivot_radar_history")
      .select("*")
      .eq(
        "source_daily_date",
        latestKey.source_daily_date
      )
      .eq(
        "source_week_start",
        latestKey.source_week_start
      )
      .order("timestamp", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    // =========================================
    // 🔥 ③ 件数
    // =========================================
    const { count } = await supabase
      .from("pivot_radar_history")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "source_daily_date",
        latestKey.source_daily_date
      )
      .eq(
        "source_week_start",
        latestKey.source_week_start
      );

    // =========================================
    // 🔥 正常返却
    // =========================================
    return NextResponse.json(
      {
        source_daily_date:
          latestKey.source_daily_date,
        source_week_start:
          latestKey.source_week_start,
        count: count ?? 0,
        timestamp:
          latestRow?.timestamp ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

  } catch (e) {
    console.error("❌ latest radar error:", e);

    return NextResponse.json(
      {
        source_daily_date: null,
        source_week_start: null,
        timestamp: null,
        error: String(e),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}