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
  const [progressText, setProgressText] = useState("READY");
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/pivot/latest", {
        cache: "no-store",
      });

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
      setCooldown((prev) => {
        if (prev <= 1) {
          setProgressText("READY");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setProgressText("FETCH START...");

      const res = await fetch("/api/pivot/radar", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("API error");

      const json = await res.json();

      // 🔥 ログ保存だけ追加（UI変更なし）
if (json?.debugLogs) {
  sessionStorage.setItem(
    "debugLogs",
    JSON.stringify(json.debugLogs)
  );

  setDebugLogs(json.debugLogs);
}

      if (Array.isArray(json)) {
        const successCount = json.filter((r) => r.success).length;

        if (successCount === 0) {
          throw new Error("All failed");
        }
      }

      await loadStatus();

      setProgressText("BUILD COMPLETE");

      window.dispatchEvent(
        new CustomEvent("load-radar")
      );

    } catch (err) {
      console.error("❌ update failed", err);

      setProgressText("ERROR / RATE LIMIT");

      setCooldown(60);

    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string | null) => d || "-";

const formatDateTime = (ts?: string | null) => {
  try {
    if (!ts) return "-";

    const normalized = ts.includes("T")
      ? ts
      : ts.replace(" ", "T");

    const safeTs = normalized.endsWith("Z") ||
      normalized.includes("+")
        ? normalized
        : `${normalized}Z`;

    const date = new Date(safeTs);

    if (isNaN(date.getTime())) {
      return "INVALID";
    }

    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

  } catch (e) {
    console.error("formatDateTime error", e);
    return "ERROR";
  }
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
          PivotRadar　更新日時：
          {formatDateTime(status?.timestamp)}
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
    minWidth: 13,
    minHeight: 13,
    borderRadius: "50%",
    flexShrink: 0,
    background:
      loading
        ? "#facc15"
        : cooldown > 0
        ? "#ef4444"
        : progressText.includes("ERROR")
        ? "#ef4444"
        : progressText.includes("COMPLETE")
        ? "#34d399"
        : "#38bdf8",
  }}
/>

          <button
          type="button"
            onClick={handleUpdate}
            disabled={loading || cooldown > 0}
            style={{
              padding: "2px 8px",
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
          type="button"
            onClick={() =>
              (window.location.href =
                "/debug/pivotRadar2")
            }
            style={{
              padding: "2px 8px",
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
<div
  style={{
    marginTop: +2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  }}
>
  {/* 左 */}
  <div>
    Daily: {formatDate(status?.source_daily_date)}　
    Weekly W: {formatDate(status?.source_week_start)}
  </div>

  {/* 右 */}
  <div
    style={{
      fontSize: 11,
      fontFamily: "monospace",
      color:
        progressText.includes("ERROR")
          ? "#f87171"
          : progressText.includes("WAIT")
          ? "#facc15"
          : progressText.includes("COMPLETE")
          ? "#34d399"
          : "#93c5fd",
      textAlign: "right",
      minWidth: 120,
    }}
  >
    {progressText}
  </div>
</div>

<div
  style={{
    marginTop: 4,
    maxHeight: 120,
    overflowY: "auto",
    fontSize: 10,
    fontFamily: "monospace",
    color: "#94a3b8",
    whiteSpace: "pre-wrap",
  }}
>
  {debugLogs.map((d, i) => (
    <div key={i}>
      {d.symbol} :
      {d.flow?.join?.(" > ") ?? "NO FLOW"}
    </div>
  ))}
</div>

    </div>
  );
}