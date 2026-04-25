"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import { HomeChartControls } from "./HomeChartControls";
import { HomeChartLayout } from "./HomeChartLayout";

import { calcZigzag } from "@/lib/chart/zigzag/calcZigzag";
import { mergeData } from "@/lib/chart/mergeData";

export function HomeChartPanel({
  activePair,
}: {
  activePair: string;
}) {
  const [symbol, setSymbol] =
    useState(activePair || "GBP/JPY");

  const [tf, setTf] =
    useState("1h");

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const twoDaysAgo = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 2
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

  const timerRef = useRef<any>(null);

  const formatSymbol = (pair: string) => {
  if (!pair) return "";

  if (pair.includes("/")) return pair;

  return pair.slice(0, 3) + "/" + pair.slice(3);
};

  // =============================
  // 🔥 activePair → symbol反映
  // =============================
  useEffect(() => {
  if (!activePair) return;

  setSymbol(formatSymbol(activePair)); // ←ここ
}, [activePair]);

  // =============================
  // 🔥 APIロード
  // =============================
  const handleLoad = async (
    targetSymbol: string
  ) => {
    setLoading(true);

    try {
      const params =
        new URLSearchParams({
          symbol: targetSymbol,
          tf,
          start: startDate,
          end: endDate,
        });

      const res = await fetch(
        `/api/chart?${params.toString()}`
      );

      const json = await res.json();

      const zigzagData =
        calcZigzag(json);

      const mergedData =
        mergeData(json, zigzagData);

      setMerged(mergedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🔥 debounce付き自動ロード
  // =============================
  useEffect(() => {
    if (!symbol) return;

    // 前の予約キャンセル
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 200ms後に実行
    timerRef.current = setTimeout(() => {
      handleLoad(symbol);
    }, 200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [symbol, tf, startDate, endDate]);

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
        onLoad={() => handleLoad(symbol)}
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