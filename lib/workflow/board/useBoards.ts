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
  // 📸 screenshots取得
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
  };
};