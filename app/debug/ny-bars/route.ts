import { NextResponse } from "next/server";

import { nyBarsBuilder } from "@/lib/market/builders/nyBarsBuilder";
import { calcPivot } from "@/lib/market/indicators/pivotCalc";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const pair =
    searchParams.get("pair") || "USD/JPY";

  const dailyDate =
    searchParams.get("dailyDate") || undefined;

  const weekStart =
    searchParams.get("weekStart") || undefined;

  const weekEnd =
    searchParams.get("weekEnd") || undefined;

  const nyBars = await nyBarsBuilder(pair, {
    dailyDate,
    weekStart,
    weekEnd,
  });

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
    intraday: nyBars.intraday,
    dailyBars: nyBars.dailyBars,
    weeklyBars: nyBars.weeklyBars,
    prevDaily: nyBars.prevDaily,
    prevWeekly: nyBars.prevWeekly,
    pivotDaily,
    pivotWeekly,
  });
}