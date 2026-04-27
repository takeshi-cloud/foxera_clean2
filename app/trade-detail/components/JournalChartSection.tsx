"use client";

import { useEffect, useState } from "react";

import { ChartControls } from "./ChartControls";
import { ChartArea } from "./ChartArea";

import { calcZigzag } from "@/lib/chart/zigzag/calcZigzag";
import { mergeData } from "@/lib/chart/mergeData";

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

export default function JournalChartSection({
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
    useState([]);

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

  const [zigzagDepth, setZigzagDepth] =
    useState(
      safeState.zigzagDepth
    );

 //----------------------------------------
// Parent Sync（完全版）
//----------------------------------------
useEffect(() => {
  if (!initialChartState) return;

  console.log("🔥 SYNC APPLY", initialChartState);

  setSymbol(initialChartState.symbol);
  setTf(initialChartState.tf);
  setStartDate(initialChartState.startDate);
  setEndDate(initialChartState.endDate);
  setShowLine(initialChartState.showLine);
  setShowZigzag(initialChartState.showZigzag);
  setZigzagDeviation(initialChartState.zigzagDeviation);
  setZigzagDepth(initialChartState.zigzagDepth);

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
  useEffect(() => {
    console.log("🔄 onChartStateChange", {
      symbol,
      tf,
      startDate,
      endDate,
    });

    onChartStateChange({
      symbol,
      tf,
      startDate,
      endDate,
      showLine,
      showZigzag,
      zigzagDeviation,
      zigzagDepth,
    });
  }, [
    symbol,
    tf,
    startDate,
    endDate,
    showLine,
    showZigzag,
    zigzagDeviation,
    zigzagDepth,
  ]);

  //----------------------------------------
  // Load Chart
  //----------------------------------------
  const load = async () => {
    console.log("🔥 LOAD START", {
      symbol,
      tf,
      startDate,
      endDate,
    });

    if (!symbol || !startDate || !endDate) {
      console.log("⛔ SKIP LOAD（未完成state）");
      return;
    }

    console.log("🚀 FETCH PARAM", {
      symbol,
      tf,
      startDate,
      endDate,
    });

    const res = await fetch(
      `/api/chart?symbol=${symbol}&tf=${tf}&start=${startDate}&end=${endDate}`
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ APIエラー:", res.status, text);
      return;
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      const text = await res.text();
      console.error("❌ JSONパース失敗:", text);
      return;
    }

    console.log("📊 FETCH RESULT", json?.[0]);

    setData(json);
  };

  //----------------------------------------
  // Auto Load
  //----------------------------------------
  useEffect(() => {
    console.log("⚠️ AutoLoad fired", {
      symbol,
      tf,
      startDate,
      endDate,
    });

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

  const merged = mergeData(
    data,
    zigzagData
  );

  //----------------------------------------
  // Render
  //----------------------------------------
  console.log("🧠 RENDER", {
    dataSample: data?.[0],
    mergedSample: merged?.[0],
  });

  return (
    <div style={{ flex: 1 }}>
      <ChartControls
        symbol={symbol}
        setSymbol={setSymbol}
        tf={tf}
        setTf={setTf}
        startDate={startDate}
        setStartDate={
          setStartDate
        }
        endDate={endDate}
        setEndDate={setEndDate}
        onLoad={load}
      />

      <ChartArea
        merged={merged}
        showLine={showLine}
        setShowLine={
          setShowLine
        }
        showZigzag={showZigzag}
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
      />
    </div>
  );
}