"use client";

import { useEffect, useState } from "react";
import { RadarScatterChart } from "./RadarScatterChart";
import { getRadarScatter } from "@/lib/pivot_radar/services/getRadarScatter";

type RadarPoint = {
  pair: string;
  x: number;
  y: number;
  timestamp: string;
};

export const RadarPanel = () => {
  const [data, setData] = useState<RadarPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const [updatedAt, setUpdatedAt] = useState("");

  // ========================================
  // Radar Load（DB → get）
  // ========================================
  const loadRadar = async () => {
    try {
      setLoading(true);

      const rows = await getRadarScatter();

      console.log("📡 scatter rows:", rows);

      setData(rows);

      // 最新時刻
      if (rows.length > 0) {
        const latest = rows[0];

        const fullTime = new Date(latest.timestamp).toLocaleString(
          "ja-JP",
          {
            timeZone: "Asia/Tokyo",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        setUpdatedAt(fullTime);
      } else {
        setUpdatedAt("");
      }

    } catch (e) {
      console.error("❌ Radar load failed:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 初回 + 更新イベント
  // ========================================
  useEffect(() => {
    loadRadar();

    const handler = () => {
      console.log("📡 load-radar → reload");
      loadRadar();
    };

    window.addEventListener("load-radar", handler);

    return () => {
      window.removeEventListener("load-radar", handler);
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
        }}
      >
        最終更新：{updatedAt || "-"}
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