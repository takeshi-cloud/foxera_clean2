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

  const [progressText, setProgressText] =
    useState("READY");

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
              ).toLocaleString("ja-JP")
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
setProgressText(
  `FETCH START ${Date.now()}`
);

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

setProgressText(
  `BUILD COMPLETE ${Date.now()}`
);
      } catch (err) {
        console.error(err);

        setProgressText("ERROR");

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

  useEffect(() => {
    if (!isCooling) {
      setProgressText("READY");
    }
  }, [isCooling]);

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
    {/* ===== 1行目 ===== */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
      }}
    >
      <div>
        MA Structure  　更新日時:
        {" "}
        {updatedAt}
      </div>

      {/* 🔥 ボタンをまとめる */}
      <div
        style={{
          display: "flex",
          gap: 2,
        }}
      >
        <button
          onClick={handleRefreshMA}
          disabled={
            isCooling || loading
          }
          style={{
            padding: "2px 4px",
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
          {loading
            ? "更新中..."
            : "更新"}
        </button>

        <button
          onClick={() => {
            router.push(
              "/debug/maStructure"
            );
          }}
          style={{
            padding: "2px 4px",
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

    {/* ===== 2行目 ===== */}
    <div
      style={{
        marginTop: -2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      {/* 左 */}
      <div>
        <ApiCooldownBadge cooldown={cooldown} />
      </div>

      {/* 右 */}
      <div
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color:
            progressText.includes(
              "ERROR"
            )
              ? "#f87171"
              : progressText.includes(
                  "COMPLETE"
                )
              ? "#34d399"
              : "#93c5fd",
          textAlign: "right",
          minWidth: 120,
        }}
      >
        {progressText}
      </div>
    </div>
  </div>
);
};