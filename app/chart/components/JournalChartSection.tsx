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
  // Parent Sync
  //----------------------------------------
  useEffect(() => {
    if (!initialChartState) return;

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
  }, [initialChartState]);

  //----------------------------------------
  // Notify Parent
  //----------------------------------------
  useEffect(() => {
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
  if (!symbol || !startDate || !endDate) return;

  const res = await fetch(
    `/api/chart?symbol=${symbol}&tf=${tf}&start=${startDate}&end=${endDate}`
  );

  // 🔥 ステータスチェック
  if (!res.ok) {
    const text = await res.text();
    console.error("APIエラー:", res.status, text);
    return;
  }

  // 🔥 JSON安全パース
  let json;
  try {
    json = await res.json();
  } catch (e) {
    const text = await res.text();
    console.error("JSONパース失敗:", text);
    return;
  }

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

  const merged = mergeData(
    data,
    zigzagData
  );

  //----------------------------------------
  // Render
  //----------------------------------------
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