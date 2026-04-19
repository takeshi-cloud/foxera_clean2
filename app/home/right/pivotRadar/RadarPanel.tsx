"use client";

import { useEffect, useState } from "react";
import { RadarScatterChart } from "./RadarScatterChart";

type RadarPoint = {
  pair: string;
  x: number;
  y: number;
  timestamp: string;
  source_daily_date?: string;
  source_week_start?: string;
  source_week_end?: string;
};


export const RadarPanel = () => {
  const [data, setData] = useState<RadarPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const [updatedAt, setUpdatedAt] = useState("");
  const [dailySource, setDailySource] = useState("");
  const [weeklySource, setWeeklySource] = useState("");

  // ========================================
  // Radar Load（修正版）
  // ========================================
  const loadRadar = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/pivot/radar");
      const json = await res.json();

      console.log("📡 API raw:", json);

      // 🔥 APIのresults → UI用に変換
      const rows: RadarPoint[] = (json?.results || [])
        .map((r: any) => {
          if (!r?.summary?.radar) return null;

          return {
            pair: r.symbol,
            x: r.summary.radar.x,
            y: r.summary.radar.y,
            timestamp: r.summary.radar.time,
            source_daily_date: r.summary?.pivot?.dailyDate,
            source_week_start: r.summary?.pivot?.weeklyDate,
          };
        })
        .filter(Boolean); // null除外

      setData(rows);

      // ====================================
      // 最新データ
      // ====================================
      if (rows.length > 0) {
        const latest = rows[0];

        const fullTime = new Date(
          latest.timestamp
        ).toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        setUpdatedAt(fullTime);
        setDailySource(latest.source_daily_date || "");

        setWeeklySource(
          latest.source_week_start
            ? `${latest.source_week_start}`
            : ""
        );
      } else {
        setUpdatedAt("");
        setDailySource("");
        setWeeklySource("");
      }
    } catch (e) {
      console.error("❌ Radar load failed:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 初回 + イベント連動
  // ========================================
  useEffect(() => {
    loadRadar();

    const handler = () => {
      console.log("📡 radar:updated → reload");
      loadRadar();
    };

    window.addEventListener("radar:updated", handler);

    return () => {
      window.removeEventListener("radar:updated", handler);
    };
  }, []);

  // ========================================
  // Render
  // ========================================
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 12,
        background: "#0f172a",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 12,
          color: "#e2e8f0",
          marginBottom: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div>最終更新：{updatedAt || "-"}</div>

        <div>
          日足Pivot元：{dailySource || "-"}
          <span style={{ marginLeft: 10 }} />
          週足Pivot元：{weeklySource || "-"}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <RadarScatterChart data={data} />
        )}
      </div>
    </div>
  );
};