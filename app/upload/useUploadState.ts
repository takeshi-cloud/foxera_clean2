"use client";

import { useState, useEffect } from "react";
import { SCREENSHOT_TYPES } from "@/lib/constants/LogOptions";

export function useUploadState() {
  // =============================
  // 🔹 基本 state（画像）
  // =============================
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const setImageFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // =============================
  // 🔹 input（ファイル選択）
  // =============================
  const handleFileChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
  };

  // =============================
  // 🔥 Ctrl+V（ペースト対応）
  // =============================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const f = e.clipboardData?.files?.[0];
      if (f) setImageFile(f);
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // =============================
  // 🔥 D&D用
  // =============================
  const handleDrop = (e: any) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setImageFile(f);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  // =============================
  // 🔥 画像削除
  // =============================
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  // =============================
  // 🔹 ログ用フォーム state
  // =============================
  const [pair, setPair] = useState("USDJPY");
  const [isCustomPair, setIsCustomPair] = useState(false);

  const [timeframe, setTimeframe] = useState("1H");
  const [direction, setDirection] = useState("long");
  const [phase, setPhase] = useState("Trend");

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const [note, setNote] = useState("");

  // =============================
  // 🔹 スクショ用（追加）
  // =============================
  const [screenshotType, setScreenshotType] = useState(
    SCREENSHOT_TYPES[0] // context
  );

  const [screenshotNote, setScreenshotNote] = useState("");

  // =============================
  // 🔹 派生ロジック
  // =============================
  const timeframeType =
    timeframe === "5M" || timeframe === "15M" ? "short" : "long";

  // =============================
  // 🔥 返却
  // =============================
  return {
    // 画像
    file,
    preview,
    handleFileChange,
    handleRemoveImage,
    handleDrop,
    handleDragOver,

    // ログ側
    pair,
    setPair,
    isCustomPair,
    setIsCustomPair,
    timeframe,
    setTimeframe,
    direction,
    setDirection,
    phase,
    setPhase,
    date,
    setDate,
    note,
    setNote,

    // スクショ側（追加）
    screenshotType,
    setScreenshotType,
    screenshotNote,
    setScreenshotNote,

    // その他
    timeframeType,
  };
}