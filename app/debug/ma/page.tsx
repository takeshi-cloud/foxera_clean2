"use client";

import { useState } from "react";

export default function MADebugPage() {
  const [pair, setPair] =
    useState("USD/JPY");

  const [result, setResult] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [allRows, setAllRows] =
    useState<any[]>([]);

  const [allLoading, setAllLoading] =
    useState(false);

  const runDebug = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/debug/ma?pair=${encodeURIComponent(
          pair
        )}`
      );

      const json = await res.json();

      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAll = async () => {
    setAllLoading(true);

    try {
      const res = await fetch(
        "/api/ma/all"
      );

      const json = await res.json();

      setAllRows(json);
    } catch (err) {
      console.error(err);
    } finally {
      setAllLoading(false);
    }
  };

  const ma = result?.result;

  return (
    <div className="p-6 space-y-10 text-white bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-bold">
        MA Debug
      </h1>

      {/* 単体デバッグ */}
      <div className="flex gap-4">
        <input
          value={pair}
          onChange={(e) =>
            setPair(e.target.value)
          }
          className="border px-3 py-2 rounded text-black"
        />

        <button
          onClick={runDebug}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Loading..."
            : "単体実行"}
        </button>
      </div>

      {ma && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <DebugCard
              title="Price"
              value={ma.price}
            />

            <DebugCard
              title="Structure"
              value={ma.structure_order?.join(
                " > "
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <DebugCard
              title="15M MA"
              value={ma.ma_now_15}
              sub={`Prev: ${ma.ma_prev_15}`}
            />

            <DebugCard
              title="1H MA"
              value={ma.ma_now_1h}
              sub={`Prev: ${ma.ma_prev_1h}`}
            />

            <DebugCard
              title="4H MA"
              value={ma.ma_now_4h}
              sub={`Prev: ${ma.ma_prev_4h}`}
            />
          </div>

          {ma.debug && (
            <div className="grid grid-cols-3 gap-4">
              <DebugCard
                title="15M Bars"
                value={ma.debug.bar_15_now}
                sub={`Prev: ${ma.debug.bar_15_prev}`}
              />

              <DebugCard
                title="1H Bars"
                value={ma.debug.bar_1h_now}
                sub={`Prev: ${ma.debug.bar_1h_prev}`}
              />

              <DebugCard
                title="4H Bars"
                value={ma.debug.bar_4h_now}
                sub={`Prev: ${ma.debug.bar_4h_prev}`}
              />
            </div>
          )}

          <details>
            <summary className="cursor-pointer text-sm text-slate-400">
              Raw JSON
            </summary>

            <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}

      {/* 全通貨一覧 */}
      <div className="space-y-4 border-t border-slate-700 pt-8">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            全通貨 MA Structure
          </h2>

          <button
            onClick={runAll}
            className="bg-emerald-600 px-4 py-2 rounded"
          >
            {allLoading
              ? "Loading..."
              : "全通貨実行"}
          </button>
        </div>

        <div className="space-y-2">
          {allRows.map((row) => (
            <div
              key={row.pair}
              className="grid grid-cols-5 gap-2 items-center bg-slate-900 rounded p-3"
            >
              <div className="font-bold">
                {row.pair}
              </div>

              {renderOrderedStructure(
                row
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================
// Ordered Structure Render
// =========================================
function renderOrderedStructure(
  row: any
) {
  if (!row.structure_order) {
    return (
      <div className="text-red-400">
        ERROR
      </div>
    );
  }

  const slopeMap: Record<
    string,
    string
  > = {
    "15M":
      row.ma_now_15 >
      row.ma_prev_15
        ? "⇧"
        : "⇩",

    "1H":
      row.ma_now_1h >
      row.ma_prev_1h
        ? "⇧"
        : "⇩",

    "4H":
      row.ma_now_4h >
      row.ma_prev_4h
        ? "⇧"
        : "⇩",
  };

  const ordered =
    [...row.structure_order].reverse();

  return (
    <div className="flex items-center gap-1">
      {ordered.map(
        (
          item: string,
          index: number
        ) => {
          if (item === "PRICE") {
            return (
              <div
                key={item}
                className="flex items-center gap-1"
              >
                <span className="text-blue-400 font-bold">
                  PRICE
                </span>

                {index <
                  ordered.length -
                    1 && (
                  <span className="text-slate-500">
                    {"<"}
                  </span>
                )}
              </div>
            );
          }

          const arrow =
            slopeMap[item];

          return (
            <div
              key={item}
              className="flex items-center gap-1"
            >
              <span className="text-white font-semibold">
                {item}
              </span>

              <span
                className={`text-xl font-black ${
                  arrow === "⇧"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {arrow}
              </span>

              {index <
                ordered.length -
                  1 && (
                <span className="text-slate-500">
                  {"<"}
                </span>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}
// =========================================
// Debug Card
// =========================================
function DebugCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: any;
  sub?: string;
}) {
  return (
    <div className="border border-slate-700 rounded p-4 bg-slate-900">
      <div className="text-sm text-slate-400">
        {title}
      </div>

      <div className="text-lg font-bold break-all">
        {String(value)}
      </div>

      {sub && (
        <div className="text-xs text-slate-500 mt-2 break-all">
          {sub}
        </div>
      )}
    </div>
  );
}