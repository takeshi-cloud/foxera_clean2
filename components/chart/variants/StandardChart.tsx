"use client";

import { useEffect, useState } from "react";

import BaseChart from "../base/BaseChart";
import ChartControls from "../controls/ChartControls";
import ChartToggles from "../controls/ChartToggles";

import {
  topBarStyle,
  pageStyle,
  loadingStyle,
} from "../base/chartStyles";

import { calcZigzag } from "@/lib/chart/zigzag/calcZigzag";
import { mergeData } from "@/lib/chart/mergeData";
import { buildDowLines } from "@/lib/chart/technical/buildDowLines";
import { buildFibExpansion } from "@/lib/chart/fibonacci/buildFibExpansion";

export default function StandardChart() {
  //----------------------------------------
  // Date
  //----------------------------------------

  const today = new Date();
  const past = new Date();

  past.setDate(today.getDate() - 10);

  const format = (d: Date) =>
    d.toISOString().slice(0, 10);

  //----------------------------------------
  // State
  //----------------------------------------

  const [data, setData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [symbol, setSymbol] =
    useState("USD/JPY");

  const [tf, setTf] =
    useState("1h");

  const [startDate, setStartDate] =
    useState(format(past));

  const [endDate, setEndDate] =
    useState(format(today));

  const [showLine, setShowLine] =
    useState(true);

  const [showZigzag, setShowZigzag] =
    useState(true);

  const [showFib, setShowFib] =
    useState(false);

  const [showPivot, setShowPivot] =
    useState(false);

  const [zigzagDeviation, setZigzagDeviation] =
    useState(0.03);

  const [zigzagDepth, setZigzagDepth] =
    useState(3);

  const [
    selectedZigzagIndex,
    setSelectedZigzagIndex,
  ] = useState(0);

  //----------------------------------------
  // Load Chart
  //----------------------------------------

  const loadChart = async () => {
    try {
      setLoading(true);

      const params =
        new URLSearchParams({
          symbol,
          tf,
          start: startDate,
          end: endDate,
        });

      const res = await fetch(
        `/api/chart?${params}`
      );

      const json =
        await res.json();

      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  //----------------------------------------
  // Auto Load
  //----------------------------------------

  useEffect(() => {
    loadChart();
  }, [
    symbol,
    tf,
    startDate,
    endDate,
  ]);

  //----------------------------------------
  // Chart Logic
  //----------------------------------------

  const zigzagData = calcZigzag(
    data,
    zigzagDeviation,
    zigzagDepth
  );

  const dowLines =
    buildDowLines(
      zigzagData
    );

  const merged =
    mergeData(
      data,
      zigzagData
    );

  const fibData =
    showFib &&
    selectedZigzagIndex != null &&
    zigzagData.length >=
      selectedZigzagIndex + 3
      ? buildFibExpansion(
          zigzagData,
          selectedZigzagIndex
        )
      : null;

  //----------------------------------------
  // Render
  //----------------------------------------

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
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
          setEndDate={
            setEndDate
          }
          onLoad={loadChart}
        />

        <ChartToggles
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
          showFib={showFib}
          setShowFib={
            setShowFib
          }
          showPivot={
            showPivot
          }
          setShowPivot={
            setShowPivot
          }
        />
      </div>

      {loading && (
        <div
          style={
            loadingStyle
          }
        >
          loading...
        </div>
      )}

      <BaseChart
        merged={merged}
        fibData={fibData}
        zigzagData={
          zigzagData
        }
        selectedZigzagIndex={
          selectedZigzagIndex
        }
        setSelectedZigzagIndex={
          setSelectedZigzagIndex
        }
        showLine={showLine}
        showZigzag={
          showZigzag
        }
        showFib={showFib}
        showPivot={
          showPivot
        }
        dowLines={dowLines}
      />
    </div>
  );
}