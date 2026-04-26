"use client";

import { useEffect, useState } from "react";

type Status = {
  source_daily_date: string | null;
  source_week_start: string | null;
  timestamp: string | null;
  count?: number;
};

export default function PivotStatusBar() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/pivot/latest");
      const json = await res.json();
      setStatus(json);
    } catch (err) {
      console.error("❌ status fetch error", err);
      setStatus(null);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/pivot/radar");
      if (!res.ok) throw new Error("API error");

      const json = await res.json();

      if (Array.isArray(json)) {
        const successCount = json.filter((r) => r.success).length;
        if (successCount === 0) throw new Error("All failed");
      }

      await loadStatus();
      window.dispatchEvent(new CustomEvent("load-radar"));
    } catch (err) {
      console.error("❌ update failed", err);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string | null) => d || "-";

  const formatDateTime = (ts?: string | null) => {
    if (!ts) return "-";

    const utc = new Date(ts);
    const jst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);

    return `${jst.getFullYear()}/${String(jst.getMonth() + 1).padStart(2, "0")}/${String(jst.getDate()).padStart(2, "0")} ${String(jst.getHours()).padStart(2, "0")}:${String(jst.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 6,
        background: "#020617",
        padding: "2px 10px",
        fontSize: 13,
        lineHeight: "1.1",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ===== 1行目 ===== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 左 */}
        <div>
          PivotRadar　更新日時：{formatDateTime(status?.timestamp)}
        </div>

        {/* 右 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* ランプ */}
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: "50%",
              background:
                cooldown > 0
                  ? "#ef4444"
                  : "#34d399",
            }}
          />

          <button
            onClick={handleUpdate}
            disabled={loading || cooldown > 0}
            style={{
              padding: "4px 8px",
              fontSize: 13,
              background:
                loading || cooldown > 0
                  ? "#475569"
                  : "#059669",
              color: "#fff",
              borderRadius: 4,
              cursor:
                loading || cooldown > 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "更新中..."
              : cooldown > 0
              ? `待機 ${cooldown}s`
              : "更新"}
          </button>

          <button
            onClick={() =>
              (window.location.href =
                "/debug/pivotRadar")
            }
            style={{
              padding: "4px 8px",
              fontSize: 13,
              background: "#6366f1",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Summary
          </button>
        </div>
      </div>

      {/* ===== 2行目 ===== */}
      <div style={{ marginTop: -2 }}>
        Daily: {formatDate(status?.source_daily_date)}　
        Weekly W: {formatDate(status?.source_week_start)}
      </div>
    </div>
  );
}