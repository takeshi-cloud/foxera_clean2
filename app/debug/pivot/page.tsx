"use client";

import { useEffect, useState } from "react";

type Row = {
  symbol: string;
  step: string;
  error?: string;
  summary?: any;
};

export default function PivotRadarDebug() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pivot/radar");
      const json = await res.json();

      console.log("API RAW", json);

      setData(json.results || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();

    const handler = () => load();
    window.addEventListener("load-radar", handler);

    return () => {
      window.removeEventListener("load-radar", handler);
    };
  }, []);

  // ===============================
  // helpers（全部ここに詰める）
  // ===============================
  const fmt = (n?: number, d = 2) =>
    n !== undefined ? n.toFixed(d) : "-";

  const time = (t?: string) => {
    if (!t) return "-";
    const d = new Date(t);
    return `${d.getUTCHours()}:${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}`;
  };

  const fmtDate = (d?: string) => {
    if (!d) return "-";
    const dt = new Date(d);
    return `${dt.getUTCMonth() + 1}-${dt.getUTCDate()}`;
  };

  const formatOHLC = (o?: any) => {
    if (!o) return "-";
    return `H:${o.high ?? "-"} L:${o.low ?? "-"} (${fmtDate(
      o.start
    )}→${fmtDate(o.end)})`;
  };

  const pivotColor = (d?: boolean, w?: boolean) => {
    if (d && w) return "text-green-400";
    if (!d && !w) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      {/* HOME */}
      <div className="mb-4">
        <a href="/" className="text-blue-400 underline">
          ← HOME
        </a>
      </div>

      <h1 className="text-lg font-bold mb-4">
        🔧 Pivot Radar Debug
      </h1>

      <button
        onClick={load}
        className="mb-4 px-3 py-1 bg-blue-600 rounded"
      >
        🔄 再取得
      </button>

      {loading && (
        <div className="mb-2 text-yellow-400">
          🔄 計算中...
        </div>
      )}

      <div className="overflow-auto">
        <table className="text-xs border-collapse w-full">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-2 border">Pair</th>
              <th className="p-2 border">Step</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Radar</th>
              <th className="p-2 border">PivotLevel</th>
              <th className="p-2 border">Pivot</th>
              <th className="p-2 border">DailyOHLC</th>
              <th className="p-2 border">WeeklyOHLC</th>
              <th className="p-2 border">Error</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-4 text-center text-slate-400"
                >
                  データなし
                </td>
              </tr>
            )}

            {data.map((r, i) => {
              const s = r.summary || {};

              return (
                <tr
                  key={i}
                  className="border-t border-slate-700 hover:bg-slate-900 align-top"
                >
                  {/* Pair */}
                  <td className="p-2 border">{r.symbol}</td>

                  {/* Step */}
                  <td
                    className={`p-2 border font-semibold ${
                      r.step === "success"
                        ? "text-emerald-400"
                        : r.step === "cache"
                        ? "text-sky-400"
                        : "text-red-400"
                    }`}
                  >
                    {r.step}
                  </td>

                  {/* Price */}
                  <td className="p-2 border">
                    {s.price
                      ? `${fmt(s.price.value, 5)} @ ${time(
                          s.price.time
                        )}`
                      : "-"}
                  </td>

                  {/* Radar */}
                  <td className="p-2 border">
                    {s.radar
                      ? `D:${fmt(s.radar.y)} / W:${fmt(
                          s.radar.x
                        )} @ ${time(s.radar.time)}`
                      : "-"}
                  </td>

                  {/* Pivot Level */}
                  <td className="p-2 border">
                    {s.pivot
                      ? `D:${s.pivot.daily?.level ?? "-"} / W:${s.pivot.weekly?.level ?? "-"}`
                      : "-"}
                  </td>

                  {/* Pivot Exists（色） */}
                  <td className="p-2 border">
                    {s.pivot?.exists ? (
                      <span
                        className={`${pivotColor(
                          s.pivot.exists.daily,
                          s.pivot.exists.weekly
                        )} font-bold`}
                      >
                        D:{s.pivot.exists.daily ? "Y" : "N"} / W:
                        {s.pivot.exists.weekly ? "Y" : "N"}
                      </span>
                    ) : "-"}
                  </td>

                  {/* Daily OHLC */}
                  <td className="p-2 border">
                    {formatOHLC(s.ohlc?.daily)}
                  </td>

                  {/* Weekly OHLC */}
                  <td className="p-2 border">
                    {formatOHLC(s.ohlc?.weekly)}
                  </td>

                  {/* Error */}
                  <td className="p-2 border text-red-400">
                    {r.error || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}