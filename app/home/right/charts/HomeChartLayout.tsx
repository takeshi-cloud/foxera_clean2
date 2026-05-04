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
   dowLines, // ←追加
   
}: Props) {
  if (loading) {
    return (
      <div style={{ color: "white" }}>
        Loading...
      </div>
    );
  }
console.log("dowLines", dowLines);
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
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