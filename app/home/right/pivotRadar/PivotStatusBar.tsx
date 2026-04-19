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

  // =========================================
  // ステータス取得
  // =========================================
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

  // =========================================
  // クールダウン
  // =========================================
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // =========================================
  // 更新処理
  // =========================================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/pivot/radar");

      if (!res.ok) {
        throw new Error("API error");
      }

      const json = await res.json();

      if (Array.isArray(json)) {
        const successCount = json.filter((r) => r.success).length;

        console.log("✅ success:", successCount, "/", json.length);

        if (successCount === 0) {
          throw new Error("All failed");
        }
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

  // =========================================
  // フォーマット（完全固定版）
  // =========================================
  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    return d;
  };

  const formatDateTime = (ts?: string | null) => {
    if (!ts) return "-";

    const utc = new Date(ts);
    const jst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);

    const y = jst.getFullYear();
    const m = String(jst.getMonth() + 1).padStart(2, "0");
    const d = String(jst.getDate()).padStart(2, "0");
    const h = String(jst.getHours()).padStart(2, "0");
    const min = String(jst.getMinutes()).padStart(2, "0");

    return `${y}/${m}/${d} ${h}:${min}`;
  };

  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-white">
      <div className="flex items-center justify-between gap-4">

        {/* 左 */}
        <div className="space-y-1 text-xs">

          {/* ① D / W を1行に */}
          <div>
            Pivot D: {formatDate(status?.source_daily_date)}　
            Pivot W: {formatDate(status?.source_week_start)}
          </div>

          {/* ② 更新時刻 */}
          <div className="text-slate-400">
            Radar更新: {formatDateTime(status?.timestamp)}
          </div>

        </div>

        {/* 右 */}
        <div className="flex items-center gap-2">

          <button
            onClick={handleUpdate}
            disabled={loading || cooldown > 0}
            className={`rounded px-3 py-1 text-xs transition ${
              loading || cooldown > 0
                ? "cursor-not-allowed bg-slate-600"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {loading
              ? "更新中..."
              : cooldown > 0
              ? `待機 ${cooldown}s`
              : "更新"}
          </button>

          {/* 🔥 追加：Summaryボタン */}
          <button
            onClick={() => (window.location.href = "/debug/pivotRadar")}
            className="rounded px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500"
          >
            Summary
          </button>

          {/* ランプ */}
          <div
            className={`h-2 w-2 rounded-full ${
              cooldown > 0
                ? "bg-red-500"
                : 13 < 10
                ? "bg-yellow-400"
                : "bg-emerald-400"
            }`}
          />

        </div>
      </div>
    </div>
  );
}