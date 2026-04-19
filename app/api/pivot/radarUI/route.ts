export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/infra/supabase";

export async function GET() {
  try {
    // ① 最新キー取得
    const { data: latestKey, error } = await supabase
      .from("pivot_radar_history")
      .select("source_daily_date, source_week_start")
      .order("source_daily_date", { ascending: false })
      .order("source_week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!latestKey) {
      return NextResponse.json({ results: [] });
    }

    // ② 同一日の全ペア取得
    const { data: rows } = await supabase
      .from("pivot_radar_history")
      .select("*")
      .eq("source_daily_date", latestKey.source_daily_date)
      .eq("source_week_start", latestKey.source_week_start);

    // ③ UI用整形（🔥ここ強化）
    const results = (rows || [])
      .map((r: any) => {
        if (r.radar_x == null || r.radar_y == null) return null;

        return {
          symbol: r.symbol,
          x: Number(r.radar_x),
          y: Number(r.radar_y),
          timestamp: r.timestamp,
          source_daily_date: r.source_daily_date,
          source_week_start: r.source_week_start,
        };
      })
      .filter(Boolean);

    console.log("📊 UI radar rows:", results.length);

    return NextResponse.json({ results });

  } catch (e) {
    console.error("❌ radarUI error:", e);
    return NextResponse.json({ results: [] });
  }
}