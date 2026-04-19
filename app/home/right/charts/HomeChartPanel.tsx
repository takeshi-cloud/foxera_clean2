"use client";

import {
  useEffect,
  useState,
} from "react";

import { HomeChartControls } from "./HomeChartControls";
import { HomeChartLayout } from "./HomeChartLayout";

import { calcZigzag } from "@/lib/chart/zigzag/calcZigzag";
import { mergeData } from "@/lib/chart/mergeData";

export function HomeChartPanel() {
  const [symbol, setSymbol] =
    useState("GBP/JPY");

  const [tf, setTf] =
    useState("1h");

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const twoDaysAgo = new Date(
    Date.now() -
      1000 * 60 * 60 * 24 * 2
  )
    .toISOString()
    .slice(0, 10);

  const [startDate, setStartDate] =
    useState(twoDaysAgo);

  const [endDate, setEndDate] =
    useState(today);

  const [merged, setMerged] =
    useState<any[]>([]);

  const [showLine, setShowLine] =
    useState(true);

  const [showZigzag, setShowZigzag] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    console.log(
      "HomeChartPanel showZigzag:",
      showZigzag
    );
  }, [showZigzag]);

  const handleLoad = async () => {
    setLoading(true);

    try {
      const params =
        new URLSearchParams({
          symbol,
          tf,
          start: startDate,
          end: endDate,
        });

      const res = await fetch(
        `/api/chart?${params.toString()}`
      );

      const json =
        await res.json();

      console.log(
        "HOME CHART RAW:",
        json[0]
      );

      const zigzagData =
        calcZigzag(json);

      const mergedData =
        mergeData(
          json,
          zigzagData
        );

      console.log(
        "HOME CHART MERGED:",
        mergedData[0]
      );

      setMerged(mergedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoad();
  }, []);

  return (
    <div
      style={{
        border: "1px solid #092853",
        borderRadius: 8,
        padding: 8,
        background: "#0f172a",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <HomeChartControls
        symbol={symbol}
        tf={tf}
        startDate={startDate}
        endDate={endDate}
        showLine={showLine}
        showZigzag={showZigzag}
        onSymbolChange={setSymbol}
        onTfChange={setTf}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onShowLineChange={setShowLine}
        onShowZigzagChange={setShowZigzag}
        onLoad={handleLoad}
      />

      <HomeChartLayout
        loading={loading}
        merged={merged}
        showLine={showLine}
        showZigzag={showZigzag}
      />
    </div>
  );
}