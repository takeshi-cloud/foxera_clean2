// lib/useBoards.ts
"use client";

import { useState, useEffect } from "react";
import { fetchBoards } from "./boardService";
import { supabase } from "@/lib/infra/supabase";

const USER_ID = "926655e5-129d-4f05-943b-dd702b662271";

export const useBoards = () => {
  const [boards, setBoards] = useState<any[]>([]);
  const [shots, setShots] = useState<any[]>([]);

  // =====================================
  // 📦 board取得
  // =====================================
  const load = async () => {
    const data = await fetchBoards(USER_ID);

    const sorted = [...data].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    console.log("📦 boards loaded:", sorted);

    setBoards(sorted);
  };

  useEffect(() => {
    load();
  }, []);

  // =====================================
  // 📸 screenshots取得（既存）
  // =====================================
  const loadShots = async () => {
    const { data, error } = await supabase
      .from("screenshots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ screenshots error:", error);
      return;
    }

    setShots(data ?? []);
  };

  useEffect(() => {
    loadShots();
  }, []);

  // =====================================
  // 📸 boardベースで取得（追加）
  // =====================================
  const loadShotsByBoards = async () => {
    if (!boards.length) return;

    const pairs = boards.map((b) => b.pair);

    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);

    const fromDate = past.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("screenshots")
      .select("*")
      .in("symbol", pairs)
      .gte("date", fromDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ screenshots error:", error);
      return;
    }

    setShots(data ?? []);
  };

  // 👉 board読み込み後に実行
 useEffect(() => {
  if (!boards.length) return;

  loadShotsByBoards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [boards.length]);

  // =====================================
  // 🖼 最新スクショ取得（追加）
  // =====================================
  const getLatestShot = (pair: string) => {
    return shots.find((s) => s.symbol === pair);
  };

  // =====================================
  // 既存
  // =====================================
  const hasScreenshot = (pair: string, timeframeType: string) => {
    return shots.some(
      (s) =>
        s.pair === pair &&
        s.timeframe_type === timeframeType
    );
  };

  return {
    boards,
    load,
    shots,
    loadShots,
    hasScreenshot,

    // 👇追加
    loadShotsByBoards,
    getLatestShot,
  };
};