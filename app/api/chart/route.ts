export const dynamic = "force-dynamic"; // ←これ追加

import { NextResponse } from "next/server";
import { chartDataBuilder } from "@/lib/chart/builders/chartDataBuilder";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol =
    searchParams.get("symbol") || "USD/JPY";

  const tf =
    searchParams.get("tf") || "1h";

  const start =
    searchParams.get("start") || "";

  const end =
    searchParams.get("end") || "";

  const data = await chartDataBuilder(
    symbol,
    tf,
    start,
    end
  );

  return NextResponse.json(data);
}