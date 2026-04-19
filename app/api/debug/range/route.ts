import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const tables = [
    { name: "ohlc_1h", tf: "1h" },
    { name: "ohlc_4h", tf: "4h" },
    { name: "ohlc_15m", tf: "15min" },
  ];

  const result = [];

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t.name)
      .select("symbol, timestamp_utc")
      .limit(5000);

    if (error) {
      console.error(error);
      continue;
    }

    if (!data || data.length === 0) continue;

    const grouped: any = {};

    data.forEach((d: any) => {
      if (!grouped[d.symbol]) grouped[d.symbol] = [];
      grouped[d.symbol].push(new Date(d.timestamp_utc));
    });

    for (const symbol in grouped) {
      const arr = grouped[symbol].sort((a, b) => a - b);

      result.push({
        symbol,
        timeframe: t.tf,
        min: arr[0].toISOString().slice(0, 10),
        max: arr[arr.length - 1].toISOString().slice(0, 10),
        count: arr.length,
      });
    }
  }

  return NextResponse.json(result);
}