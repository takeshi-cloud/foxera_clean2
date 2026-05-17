"use client";

import { useEffect, useState } from "react";
import { AnalysisChartArea } from "./AnalysisChartArea";
import { AnalysisChartControls } from "./AnalysisChartControls";
import { calcZigzag } from "@/lib/chart/zigzag/calcZigzag";
import { mergeData } from "@/lib/chart/mergeData";
import { buildFibExpansion } from "@/lib/chart/fibonacci/buildFibExpansion";
import { buildDowLines } from "@/lib/chart/technical/buildDowLines";

type ChartState = {
  symbol: string;
  tf: string;
  startDate: string;
  endDate: string;
  showLine: boolean;
  showZigzag: boolean;
  zigzagDeviation: number;
  zigzagDepth: number;
};

type Props = {
  initialChartState?: ChartState | null;
  onChartStateChange: (
    state: ChartState
  ) => void;
};

export default function AnalysisChartSection({
  initialChartState,
  onChartStateChange,
}: Props) {
  //----------------------------------------
  // Safe Defaults
  //----------------------------------------
  const safeState: ChartState =
    initialChartState ?? {
      symbol: "USD/JPY",
      tf: "1h",
      startDate: "",
      endDate: "",
      showLine: true,
      showZigzag: true,
      zigzagDeviation: 0.03,
      zigzagDepth: 3,
    };

  //----------------------------------------
  // Chart Data
  //----------------------------------------
  const [data, setData] =
    useState<any[]>([]);

  const [symbol, setSymbol] =
    useState(safeState.symbol);

  const [tf, setTf] =
    useState(safeState.tf);

  const [startDate, setStartDate] =
    useState(safeState.startDate);

  const [endDate, setEndDate] =
    useState(safeState.endDate);

  const [showLine, setShowLine] =
    useState(safeState.showLine);

  const [showZigzag, setShowZigzag] =
    useState(safeState.showZigzag);

  const [
    zigzagDeviation,
    setZigzagDeviation,
  ] = useState(
    safeState.zigzagDeviation
  );

  const [
    zigzagDepth,
    setZigzagDepth,
  ] = useState(
    safeState.zigzagDepth
  );

  const [
  selectedZigzagIndex,
  setSelectedZigzagIndex,
] = useState(0);

const [showFib, setShowFib]
 = useState(false);

 const [
  showPivot,
  setShowPivot,
] = useState(false);

  

  //----------------------------------------
  // Parent Sync
  //----------------------------------------
  useEffect(() => {
    if (!initialChartState)
      return;

    console.log(
      "🔥 SYNC APPLY",
      initialChartState
    );

    setSymbol(
      initialChartState.symbol
    );

    setTf(
      initialChartState.tf
    );

    setStartDate(
      initialChartState.startDate
    );

    setEndDate(
      initialChartState.endDate
    );

    setShowLine(
      initialChartState.showLine
    );

    setShowZigzag(
      initialChartState.showZigzag
    );

    setZigzagDeviation(
      initialChartState.zigzagDeviation
    );

    setZigzagDepth(
      initialChartState.zigzagDepth
    );
  }, [
    initialChartState?.symbol,
    initialChartState?.tf,
    initialChartState?.startDate,
    initialChartState?.endDate,
    initialChartState?.showLine,
    initialChartState?.showZigzag,
    initialChartState?.zigzagDeviation,
    initialChartState?.zigzagDepth,
  ]);

  //----------------------------------------
  // Notify Parent
  //----------------------------------------
//  useEffect(() => {
//    onChartStateChange({
//      symbol,
//      tf,
//      startDate,
//      endDate,
//      showLine,
//      showZigzag,
//      zigzagDeviation,
//      zigzagDepth,
//    });
//  }, [
//    symbol,
//    tf,
//    startDate,
//    endDate,
//    showLine,
//    showZigzag,
//    zigzagDeviation,
//    zigzagDepth,
//  ]);

  //----------------------------------------
  // Load Chart
  //----------------------------------------
  const load = async () => {
    console.log(
      "🔥 LOAD START",
      {
        symbol,
        tf,
        startDate,
        endDate,
      }
    );

    if (
      !symbol ||
      !startDate ||
      !endDate
    ) {
      console.log(
        "⛔ SKIP LOAD"
      );
      return;
    }

    const res = await fetch(
      `/api/chart?symbol=${symbol}&tf=${tf}&start=${startDate}&end=${endDate}`
    );

    if (!res.ok) {
      const text =
        await res.text();

      console.error(
        "❌ API ERROR",
        text
      );

      return;
    }

    const json =
      await res.json();

    console.log(
      "📊 FETCH RESULT",
      json?.[0]
    );

    setData(json);
  };

  //----------------------------------------
  // Auto Load
  //----------------------------------------
  useEffect(() => {
    load();
  }, [
    symbol,
    tf,
    startDate,
    endDate,
  ]);

  //----------------------------------------
  // ZigZag
  //----------------------------------------
  const zigzagData =
    calcZigzag(
      data,
      zigzagDeviation,
      zigzagDepth
    );

console.log(
  "🔥 ZIGZAG",
  zigzagData
);

console.log(
  "🔥 ZIGZAG LENGTH",
  zigzagData.length
);

//----------------------------------------
// 🔥 Dow Theory
//----------------------------------------
const dowLines =
  buildDowLines(
    zigzagData
  );

console.log(
  "🔥 DOW",
  dowLines
);

  //----------------------------------------
  // Merge
  //----------------------------------------
  const merged =
    mergeData(
      data,
      zigzagData
    );

//----------------------------------------
// 🔥 Fib
//----------------------------------------
const fibData =
  showFib &&
  selectedZigzagIndex !=
    null &&
  zigzagData.length >=
    selectedZigzagIndex +
      3
    ? buildFibExpansion(
        zigzagData,
        selectedZigzagIndex
      )
    : null;

console.log(
  "🔥 FIB",
  fibData
);

  //----------------------------------------
  // Render
  //----------------------------------------
  return (
    <div style={{ flex: 1 }}>
      <AnalysisChartControls
        symbol={symbol}
        setSymbol={setSymbol}
        tf={tf}
        setTf={setTf}
        startDate={startDate}
        setStartDate={
          setStartDate
        }
        endDate={endDate}
        setEndDate={
          setEndDate
        }
        onLoad={load}
      />

<AnalysisChartArea
  merged={merged}
  fibData={fibData}
  zigzagData={zigzagData}
  selectedZigzagIndex={
    selectedZigzagIndex
  }
  setSelectedZigzagIndex={
    setSelectedZigzagIndex
  }
  showFib={showFib}
  setShowFib={
    setShowFib
  }
  showPivot={showPivot}
  setShowPivot={
    setShowPivot
  }
  showLine={showLine}
  setShowLine={
    setShowLine
  }
  showZigzag={
    showZigzag
  }
  setShowZigzag={
    setShowZigzag
  }

  zigzagDeviation={
    zigzagDeviation
  }
  setZigzagDeviation={
    setZigzagDeviation
  }

  zigzagDepth={
    zigzagDepth
  }
  setZigzagDepth={
    setZigzagDepth
  }
  dowLines={dowLines}
/>
    </div>
  );
}