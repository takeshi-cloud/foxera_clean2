"use client";

import { HomeChartContainer } from "./HomeChartContainer";

type Props = {
  loading: boolean;
  merged: any[];
  showLine: boolean;
  showZigzag: boolean;
};

export function HomeChartLayout({
  loading,
  merged,
  showLine,
  showZigzag,
}: Props) {
  if (loading) {
    return (
      <div style={{ color: "white" }}>
        Loading...
      </div>
    );
  }

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
      />
    </div>
  );
}