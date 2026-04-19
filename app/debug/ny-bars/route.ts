import { NextResponse } from "next/server";

import { nyBarsBuilder } from "@/lib/market/builders/nyBarsBuilder";
import { calcPivot } from "@/lib/market/indicators/pivotCalc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const pair =
    searchParams.get("pair") || "USD/JPY";

  // ❌ これは今の関数では使えないので一旦無視
  // const dailyDate = ...
  // const weekStart = ...
  // const weekEnd = ...

  // ✅ 正しくはこれだけ
  const nyBars = await nyBarsBuilder(pair);

  const pivotDaily = calcPivot(
    nyBars.prevDaily.high,
    nyBars.prevDaily.low,
    nyBars.prevDaily.close
  );

  const pivotWeekly = calcPivot(
    nyBars.prevWeekly.high,
    nyBars.prevWeekly.low,
    nyBars.prevWeekly.close
  );

  return NextResponse.json({
    pair,
    prevDaily: nyBars.prevDaily,
    prevWeekly: nyBars.prevWeekly,
    pivotDaily,
    pivotWeekly,
  });
}