"use client";

import { useEffect, useState } from "react";

export default function DebugPivotRadarPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pivot/radar")
      .then((res) => res.json())
      .then((json) => {
        setData(json.results || []);
        setLoading(false);
      });
  }, []);

  const fmt = (v: any, d = 4) =>
    typeof v === "number" ? v.toFixed(d) : "-";

  const time = (ts?: string) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    });
  };

  // 🔥 ログ整形＋強調
  const renderTrace = (flow: any[] = []) => {
    return flow.map((f, i) => {
      const text =
        f.step +
        (f.data ? " " + JSON.stringify(f.data) : "");

      const isError =
        f.step.includes("ERROR") ||
        f.step.includes("STOP") ||
        f.step.includes("FAILED");

      return (
        <div
          key={i}
          className={`whitespace-pre-wrap ${
            isError ? "text-red-400 font-semibold" : ""
          }`}
        >
          {text}
        </div>
      );
    });
  };

 return (
  <div className="p-6 bg-slate-950 text-white min-h-screen">

    {/* 🔥 HOMEボタン */}
    <div className="mb-4">
      <button
        onClick={() => (window.location.href = "/home")}
        className="rounded bg-slate-700 px-3 py-1 text-xs hover:bg-slate-600 transition"
      >
        ← HOME
      </button>
    </div>

    <h1 className="text-lg font-bold mb-4">
      🔧 Pivot Radar Debug
    </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto border border-slate-700">
          <table className="w-full text-xs border-collapse">

            {/* HEADER */}
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-2 border">Pair</th>
                <th className="p-2 border">Step</th>

                <th className="p-2 border">Price</th>
                <th className="p-2 border">PriceTime</th>

                <th className="p-2 border">X</th>
                <th className="p-2 border">Y</th>

                <th className="p-2 border">RadarTime</th>
                <th className="p-2 border">Now(UTC)</th>

                <th className="p-2 border">Trace</th>

                <th className="p-2 border">Error</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {data.map((r, i) => {
                const s = r.summary;

                return (
                  <tr
                    key={i}
                    className="border-t border-slate-700 hover:bg-slate-900 align-top"
                  >
                    <td className="p-2 border">{r.symbol}</td>

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

                    <td className="p-2 border">
                      {fmt(s?.price?.value, 5)}
                    </td>

                    <td className="p-2 border">
                      {time(s?.price?.time)}
                    </td>

                    <td className="p-2 border">
                      {fmt(s?.radar?.x, 4)}
                    </td>

                    <td className="p-2 border">
                      {fmt(s?.radar?.y, 4)}
                    </td>

                    <td className="p-2 border">
                      {time(s?.radar?.time)}
                    </td>

                    <td className="p-2 border">
                      {time(s?.now?.utc)}
                    </td>

                    {/* 🔥 TRACE（強調付き） */}
                    <td className="p-2 border text-[10px] text-slate-300">
                      {renderTrace(r.trace?.flow)}
                    </td>

                    {/* ERROR */}
                    <td className="p-2 border text-red-400">
                      {r.error || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}