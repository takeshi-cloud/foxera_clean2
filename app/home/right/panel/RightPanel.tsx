"use client";

import PivotStatusBar from "../pivotRadar/PivotStatusBar";
import { MAStatusBar } from "../ma/MAStatusBar";
import { RadarPanel } from "../pivotRadar/RadarPanel";
import { MAStructurePanel } from "../ma/MAStructurePanel";
import { HomeChartPanel } from "../charts/HomeChartPanel";
import { ScreenshotPanel } from "../screenshot/ScreenshotPanel";

export const RightPanel = ({
  activePair,
  setActivePair,
}: {
  activePair: string;
  setActivePair: (pair: string) => void;
}) => {
  return (
    <div
      style={{
        padding: 10,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          height: "100%",
          minHeight: 0,
        }}
      >
        {/* =========================
            🔴 上段
        ========================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "5.5fr 4.5fr",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <PivotStatusBar />
          <MAStatusBar />
        </div>

        {/* =========================
            🟡 中段
        ========================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "5.5fr 4.5fr",
            gap: 5,
            flex: "0 0 45%",
            minHeight: 400,
          }}
        >
<RadarPanel
  activePair={activePair}
  setActivePair={setActivePair}
/>

<MAStructurePanel
  activePair={activePair}
  setActivePair={setActivePair}
/>
        </div>

        {/* =========================
            🟢 下段（ここが核心）
        ========================= */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",          // ← 横スクロール
            overflowY: "hidden",
            gap: 8,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* スクショ（固定） */}
          <div
            style={{
              minWidth: 380,
              maxWidth: 420,
              flexShrink: 0,
            }}
          >
<ScreenshotPanel
  activePair={activePair}
  setActivePair={setActivePair}
/>
          </div>

          {/* チャート（広く） */}
          <div
            style={{
              minWidth: 800,           // ← ここが主役
              flex: "1 1 auto",
            }}
          >
 <HomeChartPanel
  activePair={activePair}
  setActivePair={setActivePair}
/>
          </div>
        </div>
      </div>
    </div>
  );
};