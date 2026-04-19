"use client";

import { useEffect, useState } from "react";

import { useApiCooldown } from "@/lib/hooks/useApiCooldown";
import { ApiCooldownBadge } from "@/app/components/ApiCooldownBadge";

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
    <div className="rounded border border-slate-700 bg-slate-900 p-3 text-sm text-white">
      <div className="flex items-center justify-between">
        <div>
          MA更新: {updatedAt}
        </div>

        <button
          onClick={
            handleRefreshMA
          }
          disabled={
            isCooling || loading
          }
          className={`rounded px-3 py-1 text-xs ${
            isCooling || loading
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-emerald-600"
          }`}
        >
          {loading
            ? "更新中..."
            : "更新"}
        </button>
      </div>

      <div className="mt-2">
        <ApiCooldownBadge
          cooldown={cooldown}
        />
      </div>
    </div>
  );
};