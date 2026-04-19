"use client";

import { useState, useEffect } from "react";

export function useUploadState() {
  // =============================
  // 🔹 基本 state（画像）
  // =============================
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 🔥 共通処理（ここが重要）
  // 👉 すべての画像入力（input / paste / drop）はここを通す
  // 👉 file と preview を必ずセットで更新する
  const setImageFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // =============================
  // 🔹 input（ファイル選択）
  // =============================
  const handleFileChange = (e: any) => {
    const f = e.target.files[0];
    if (!f) return;

    // 👉 ファイル選択時は共通処理へ
    setImageFile(f);
  };

  // =============================
  // 🔥 Ctrl+V（ペースト対応）
  // =============================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const f = e.clipboardData?.files[0];

      // 👉 画像が貼られた場合のみ反応
      if (f) setImageFile(f);
    };

    // 👉 グローバルで監視（どこでも貼れる）
    document.addEventListener("paste", handlePaste);

    // 👉 クリーンアップ（重要）
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // =============================
  // 🔥 D&D用（ドラッグ＆ドロップ）
  // =============================
  const handleDrop = (e: any) => {
    e.preventDefault();

    const f = e.dataTransfer.files?.[0];

    // 👉 ドロップされたファイルを共通処理へ
    if (f) setImageFile(f);
  };

  const handleDragOver = (e: any) => {
    // 👉 デフォルト挙動を止めないとドロップできない
    e.preventDefault();
  };

  // =============================
  // 🔥 画像削除
  // =============================
  const handleRemoveImage = () => {
    // 👉 file と preview を両方クリア
    // 👉 UI側の「×ボタン」から呼ばれる
    setFile(null);
    setPreview(null);
  };

  // =============================
  // 🔹 フォーム state
  // =============================
  const [pair, setPair] = useState("USDJPY");

  // 👉 「その他」選択時に入力モードへ切替
  const [isCustomPair, setIsCustomPair] = useState(false);

  const [timeframe, setTimeframe] = useState("1H");
  const [direction, setDirection] = useState("long");
  const [phase, setPhase] = useState("Trend");

  // 👉 初期値は「今日」
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const [note, setNote] = useState("");

  // 👉 timeframeから内部用タイプを自動判定
  const timeframeType =
    timeframe === "5M" || timeframe === "15M" ? "short" : "long";

  // =============================
  // 🔥 返却（ここ重要）
  // =============================
  return {
    file,
    preview,
    handleFileChange,
    handleRemoveImage,

    // 🔥 D&D関連
    handleDrop,
    handleDragOver,

    // 🔹 ペア関連
    pair,
    setPair,

    // 👉 UIで使うので必ず返す（これ抜けるとエラーになる）
    isCustomPair,
    setIsCustomPair,

    // 🔹 その他フォーム
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

    // 👉 board用ロジックで使用
    timeframeType,
  };
}