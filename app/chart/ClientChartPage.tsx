"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import JournalChartSection from "@/app/trade-detail/components/JournalChartSection";
import { MARKETS } from "@/lib/constants/markets";

export default function ClientChartPage() {
  const params = useSearchParams();

  // 🔥 URLから受け取る（key）
  const rawSymbol = params.get("symbol");

  // 🔥 key → label に変換（ここだけ追加）
  const market = MARKETS.find(
    (m) => m.key === rawSymbol
  );
  console.log("rawSymbol:", rawSymbol);

  const symbol = market?.label;

  // 今日
  const today = new Date();

  // 10日前
  const past = new Date();
  past.setDate(today.getDate() - 10);

  const format = (d: Date) =>
    d.toISOString().slice(0, 10);

  const startDate = format(past);
  const endDate = format(today);

  const [chartState, setChartState] =
    useState(null);

  // ❗ symbolなければ描画しない
  if (!symbol) return null;

  return (
    <div
      style={{
        padding: 20,
        background: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <h2>Chart</h2>

      <JournalChartSection
        key={`${symbol}-${startDate}-${endDate}`}
        initialChartState={{
          symbol,
          tf: "1h",
          startDate,
          endDate,
          showLine: true,
          showZigzag: true,
          zigzagDeviation: 0.03,
          zigzagDepth: 3,
        }}
        onChartStateChange={setChartState}
      />
    </div>
  );
}