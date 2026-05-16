"use client";

import { HomeChartContainer } from "./HomeChartContainer";

type Props = {
  loading: boolean;
  merged: any[];
  showLine: boolean;
  showZigzag: boolean;
  dowLines: any[];
};

export function HomeChartLayout({
  loading,
  merged,
  showLine,
  showZigzag,
  dowLines,
}: Props) {
  console.log("dowLines", dowLines);

  // =========================
  // ローディング中
  // =========================
  if (loading) {
    return (
      <div
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading...
      </div>
    );
  }

  // =========================
  // データ未取得時
  // （初回空描画防止）
  // =========================
  if (!merged || merged.length === 0) {
    return (
      <div
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
        }}
      >
        Waiting chart data...
      </div>
    );
  }

  // =========================
  // Chart
  // =========================
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0, // ← flex崩れ対策（重要）
        overflow: "hidden",
        height: "100%",
      }}
    >
      <HomeChartContainer
        merged={merged}
        showLine={showLine}
        showZigzag={showZigzag}
        dowLines={dowLines}
      />
    </div>
  );
}