"use client";

import PivotStatusBar from "../pivotRadar/PivotStatusBar";
import { MAStatusBar } from "../ma/MAStatusBar";
import { RadarPanel } from "../pivotRadar/RadarPanel";
import { MAStructurePanel } from "../ma/MAStructurePanel";
import { HomeChartPanel } from "../charts/HomeChartPanel";
import { ScreenshotPanel } from "../screenshot/ScreenshotPanel";

export const RightPanel = ({
  activePair,

}: {
  activePair: string;
}) => {
  return (
    <div
      style={{
        padding: 10,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          height: "100%",
          minHeight: 0,
        }}
      >
        {/* 上段 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            flexShrink: 0,
          }}
        >
      
        </div>

        {/* 中段 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            flex: "0 0 45%",
            minHeight: 500,
            overflow: "visible",
          }}
        >
          <RadarPanel
            activePair={activePair}
          />

          <MAStructurePanel activePair={activePair} />
        </div>

        {/* 下段 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <ScreenshotPanel activePair={activePair} />

          <HomeChartPanel activePair={activePair} />
        </div>
      </div>
    </div>
  );
};