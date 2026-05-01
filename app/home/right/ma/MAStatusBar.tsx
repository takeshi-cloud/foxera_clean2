"use client";

import { useEffect, useState } from "react";

import { useApiCooldown } from "@/lib/hooks/useApiCooldown";
import { ApiCooldownBadge } from "@/app/components/ApiCooldownBadge";
import { useMAStore } from "@/lib/store/maStore";
import { useRouter } from "next/navigation";

export const MAStatusBar = () => {
  const [updatedAt, setUpdatedAt] =
    useState("-");

  const [loading, setLoading] =
    useState(false);

  const {
    cooldown,
    isCooling,
    startCooldown,
  } = useApiCooldown();

  // 🔥 これ追加
  const setData = useMAStore((s) => s.setData);
  const router = useRouter();

  const loadLatestTime =
    async () => {
      try {
        const res = await fetch(
          "/api/ma/latest"
        );

        const json =
          await res.json();

        setUpdatedAt(
          json.baseTime
            ? new Date(
                json.baseTime
              ).toLocaleString(
                "ja-JP"
              )
            : "-"
        );
      } catch (err) {
        console.error(err);
      }
    };

  const handleRefreshMA =
    async () => {
      if (isCooling || loading)
        return;

      setLoading(true);

      try {
        const res = await fetch(
          "/api/ma/all"
        );

        const json =
          await res.json();

        // 🔥 これ追加（最重要）
        setData(json.rows || []);

        const hasError =
          Array.isArray(json) &&
          json.some(
            (row: any) =>
              row?.error
          );

        if (hasError) {
          startCooldown(60);
        }

        window.dispatchEvent(
          new Event("load-ma")
        );

        await loadLatestTime();
      } catch (err) {
        console.error(err);

        if (
          String(err).includes(
            "429"
          )
        ) {
          startCooldown(60);
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadLatestTime();
  }, []);

return (
  <div
    style={{
      border: "1px solid #334155",
      borderRadius: 6,
      background: "#020617",
      padding: "2px 10px",
      lineHeight: 1.1,
      fontSize: 12,
      color: "#e2e8f0",
      fontFamily: "sans-serif",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 50,
      }}
    >
      <div>
        MA Structure  　更新日時: {updatedAt}
      </div>

      {/* 🔥 ボタンをまとめる */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleRefreshMA}
          disabled={isCooling || loading}
          style={{
            padding: "4px 10px",
            fontSize: 12,
            background:
              isCooling || loading
                ? "#e9ecf0b7"
                : "#059669",
            borderRadius: 4,
            cursor:
              isCooling || loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "更新中..." : "更新"}
        </button>

        <button
          onClick={() => {
            router.push ( "/debug/maStructure");
          }}
          style={{
            padding: "4px 10px",
            fontSize: 12,
            background: "#6366f1",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Summary
        </button>
      </div>
    </div>

    <div style={{ marginTop: -2 }}>
      <ApiCooldownBadge cooldown={cooldown} />
    </div>
  </div>
);
};