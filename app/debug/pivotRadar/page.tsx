"use client";

import { useEffect, useState } from "react";

export default function DebugPivotRadarPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pivot/radar");
      const json = await res.json();
      console.log("📊 DEBUG DATA", json);
      setData(json?.results || []);
    } catch (e) {
      console.error("❌ fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (v: any, d = 4) =>
    typeof v === "number" && !isNaN(v) ? v.toFixed(d) : "-";

  const anyFmt = (v: any) => {
    if (v === null) return "null";
    if (v === undefined) return "undef";
    if (typeof v === "number" && isNaN(v)) return "NaN";
    return String(v);
  };

  const time = (ts?: string) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    });
  };

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

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded bg-slate-700 px-3 py-1 text-xs hover:bg-slate-600"
        >
          ← HOME
        </button>

        <button
          onClick={load}
          className="rounded bg-emerald-600 px-3 py-1 text-xs hover:bg-emerald-500"
        >
          🔄 再取得
        </button>
      </div>

      <h1 className="text-lg font-bold mb-4">
        🔧 Pivot Radar Debug（完全版）
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto border border-slate-700">
          <table className="w-full text-[10px] border-collapse">

            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-2 border">Pair</th>
                <th className="p-2 border">Step</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Radar</th>

                <th className="p-2 border">Daily Pivot</th>
                <th className="p-2 border">Weekly Pivot</th>

                <th className="p-2 border">RAW Pivot</th>

                <th className="p-2 border">NY Daily</th>
                <th className="p-2 border">NY Weekly</th>

                <th className="p-2 border">Range</th>
                <th className="p-2 border">Counts</th>

                <th className="p-2 border">Trace</th>
                <th className="p-2 border">Error</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const s = r.summary;
                const bars = s?.debug?.pivotRaw?.debug?.bars;
                const range = bars?.debug?.range;
                const counts = bars?.debug?.counts;
                const raw = s?.debug?.pivotRaw?.raw;

                return (
                  <tr key={i} className="border-t border-slate-700 align-top">

                    <td className="p-2 border">{r.symbol}</td>
                    <td className="p-2 border">{r.step}</td>

                    {/* Price */}
                    <td className="p-2 border">
                      {s?.price
                        ? `${fmt(s.price.value, 5)} @ ${time(s.price.time)}`
                        : "-"}
                    </td>

                    {/* Radar */}
                    <td className="p-2 border">
                      {s?.radar
                        ? `X:${fmt(s.radar.x)} Y:${fmt(s.radar.y)}`
                        : "-"}
                    </td>

                    {/* Daily Pivot（両対応） */}
                    <td className="p-2 border">
                      {s?.pivot?.daily ? (
                        <>
                          PP:{fmt(s.pivot.daily.pp ?? s.pivot.daily.PP)}<br />
                          R1:{fmt(s.pivot.daily.r1 ?? s.pivot.daily.R1)}<br />
                          S1:{fmt(s.pivot.daily.s1 ?? s.pivot.daily.S1)}
                        </>
                      ) : "-"}
                    </td>

                    {/* Weekly Pivot（両対応） */}
                    <td className="p-2 border">
                      {s?.pivot?.weekly ? (
                        <>
                          PP:{fmt(s.pivot.weekly.pp ?? s.pivot.weekly.PP)}<br />
                          R1:{fmt(s.pivot.weekly.r1 ?? s.pivot.weekly.R1)}<br />
                          S1:{fmt(s.pivot.weekly.s1 ?? s.pivot.weekly.S1)}
                        </>
                      ) : "-"}
                    </td>

                    {/* RAW（ここ最重要） */}
                    <td className="p-2 border text-[9px]">
                      <pre>{JSON.stringify(raw, null, 1)}</pre>
                    </td>

                    {/* NY Daily */}
                    <td className="p-2 border">
                      {bars?.prevDaily ? (
                        <>
                          H:{fmt(bars.prevDaily.high)}<br />
                          L:{fmt(bars.prevDaily.low)}<br />
                          C:{fmt(bars.prevDaily.close)}
                        </>
                      ) : "null"}
                    </td>

                    {/* NY Weekly */}
                    <td className="p-2 border">
                      {bars?.prevWeekly ? (
                        <>
                          H:{fmt(bars.prevWeekly.high)}<br />
                          L:{fmt(bars.prevWeekly.low)}<br />
                          C:{fmt(bars.prevWeekly.close)}
                        </>
                      ) : "null"}
                    </td>

                    {/* Range */}
                    <td className="p-2 border">
                      {range ? (
                        <>
                          D:{time(range.dailyStart)}<br />
                          →{time(range.dailyEnd)}<br />
                          W:{time(range.weeklyStart)}<br />
                          →{time(range.weeklyEnd)}
                        </>
                      ) : "-"}
                    </td>

                    {/* Counts */}
                    <td className="p-2 border">
                      {counts ? (
                        <>
                          i:{counts.intraday}<br />
                          d:{counts.daily}<br />
                          w:{counts.weekly}
                        </>
                      ) : "-"}
                    </td>

                    {/* Trace */}
                    <td className="p-2 border">
                      {renderTrace(r.trace?.flow)}
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
      )}
    </div>
  );
}