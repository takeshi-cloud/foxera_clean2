"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugPivotRadarPage() {
  const [data, setData] = useState<any[]>([]);
  const [prevData, setPrevData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pivot/radar?force=true");
      const json = await res.json();

      setPrevData(data);
      setData(Array.isArray(json?.results) ? json.results : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (v: any, d = 4) =>
    typeof v === "number" && !isNaN(v) ? v.toFixed(d) : "-";

  const safe = (v: any) => {
    try {
      return JSON.stringify(v, null, 1);
    } catch {
      return "-";
    }
  };

  const colorize = (cur: any, prev: any) => {
    if (cur === undefined || prev === undefined) return "white";
    if (Number(cur) !== Number(prev)) return "#60a5fa";
    return "white";
  };

  const prevMap = new Map(prevData.map((r) => [r.symbol, r]));

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16, background: "#020617", color: "white" }}>
      
      {/* 🔥 HOMEボタン */}
      <div style={{ marginBottom: 10 }}>
        <Link href="/" style={{ color: "#60a5fa" }}>
          ← HOME
        </Link>
      </div>

      <h1>Pivot Radar Debug（完全版）</h1>

      <button onClick={load}>🔄 reload</button>

      <table
        style={{
          width: "100%",
          fontSize: 11,
          tableLayout: "fixed", // 🔥 崩れ防止
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 80 }}>Pair</th>
            <th style={{ width: 80 }}>Step</th>

            <th style={{ width: 100 }}>Price</th>
            <th style={{ width: 120 }}>Radar</th>

            <th style={{ width: 140 }}>Daily Pivot</th>
            <th style={{ width: 140 }}>Weekly Pivot</th>

            <th style={{ width: 200 }}>RAW</th>

            <th style={{ width: 140 }}>NY Daily</th>
            <th style={{ width: 140 }}>NY Weekly</th>

            <th style={{ width: 180 }}>Range</th>
            <th style={{ width: 100 }}>Counts</th>

            <th style={{ width: 220 }}>Trace</th>
            <th style={{ width: 100 }}>Error</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => {
            const s = r?.summary;
            const pivotRaw = s?.debug?.pivotRaw;

            const bars = pivotRaw?.debug?.bars;
            const range = bars?.debug?.range;
            const counts = bars?.debug?.counts;
            const raw = pivotRaw?.raw;

            const prev = prevMap.get(r.symbol);
            const prevBars = prev?.summary?.debug?.pivotRaw?.debug?.bars;

            return (
              <tr key={i}>
                <td>{r.symbol}</td>
                <td>{r.step}</td>

                {/* Price */}
                <td style={{ color: colorize(s?.price?.value, prev?.summary?.price?.value) }}>
                  {s?.price ? fmt(s.price.value, 5) : "-"}
                </td>

                {/* Radar */}
                <td>
                  <div style={{ color: colorize(s?.radar?.x, prev?.summary?.radar?.x) }}>
                    X: {fmt(s?.radar?.x)}
                  </div>
                  <div style={{ color: colorize(s?.radar?.y, prev?.summary?.radar?.y) }}>
                    Y: {fmt(s?.radar?.y)}
                  </div>
                </td>

                {/* Daily Pivot */}
                <td>
                  <div style={{ color: colorize(s?.pivot?.daily?.PP, prev?.summary?.pivot?.daily?.PP) }}>
                    PP: {fmt(s?.pivot?.daily?.PP ?? s?.pivot?.daily?.pp)}
                  </div>
                  <div style={{ color: colorize(s?.pivot?.daily?.R1, prev?.summary?.pivot?.daily?.R1) }}>
                    R1: {fmt(s?.pivot?.daily?.R1 ?? s?.pivot?.daily?.r1)}
                  </div>
                  <div style={{ color: colorize(s?.pivot?.daily?.S1, prev?.summary?.pivot?.daily?.S1) }}>
                    S1: {fmt(s?.pivot?.daily?.S1 ?? s?.pivot?.daily?.s1)}
                  </div>
                </td>

                {/* Weekly Pivot */}
                <td>
                  <div style={{ color: colorize(s?.pivot?.weekly?.PP, prev?.summary?.pivot?.weekly?.PP) }}>
                    PP: {fmt(s?.pivot?.weekly?.PP ?? s?.pivot?.weekly?.pp)}
                  </div>
                  <div style={{ color: colorize(s?.pivot?.weekly?.R1, prev?.summary?.pivot?.weekly?.R1) }}>
                    R1: {fmt(s?.pivot?.weekly?.R1 ?? s?.pivot?.weekly?.r1)}
                  </div>
                  <div style={{ color: colorize(s?.pivot?.weekly?.S1, prev?.summary?.pivot?.weekly?.S1) }}>
                    S1: {fmt(s?.pivot?.weekly?.S1 ?? s?.pivot?.weekly?.s1)}
                  </div>
                </td>

                {/* RAW */}
                <td>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{safe(raw)}</pre>
                </td>

                {/* NY Daily */}
                <td>
                  <div style={{ color: colorize(bars?.prevDaily?.high, prevBars?.prevDaily?.high) }}>
                    H: {fmt(bars?.prevDaily?.high)}
                  </div>
                  <div style={{ color: colorize(bars?.prevDaily?.low, prevBars?.prevDaily?.low) }}>
                    L: {fmt(bars?.prevDaily?.low)}
                  </div>
                  <div style={{ color: colorize(bars?.prevDaily?.close, prevBars?.prevDaily?.close) }}>
                    C: {fmt(bars?.prevDaily?.close)}
                  </div>
                </td>

                {/* NY Weekly */}
                <td>
                  <div style={{ color: colorize(bars?.prevWeekly?.high, prevBars?.prevWeekly?.high) }}>
                    H: {fmt(bars?.prevWeekly?.high)}
                  </div>
                  <div style={{ color: colorize(bars?.prevWeekly?.low, prevBars?.prevWeekly?.low) }}>
                    L: {fmt(bars?.prevWeekly?.low)}
                  </div>
                  <div style={{ color: colorize(bars?.prevWeekly?.close, prevBars?.prevWeekly?.close) }}>
                    C: {fmt(bars?.prevWeekly?.close)}
                  </div>
                </td>

                {/* Range */}
                <td>
                  {range && (
                    <>
                      D:{range.dailyStart}<br />
                      →{range.dailyEnd}<br />
                      W:{range.weeklyStart}<br />
                      →{range.weeklyEnd}
                    </>
                  )}
                </td>

                {/* Counts */}
                <td>
                  {counts && (
                    <>
                      i:{counts.intraday}<br />
                      d:{counts.daily}<br />
                      w:{counts.weekly}
                    </>
                  )}
                </td>

                {/* 🔥 Trace 折りたたみ */}
                <td>
                  <details>
                    <summary style={{ cursor: "pointer", color: "#60a5fa" }}>
                      view
                    </summary>
                    <pre style={{ fontSize: 10, whiteSpace: "pre-wrap" }}>
                      {safe(r?.trace?.flow)}
                    </pre>
                  </details>
                </td>

                {/* Error */}
                <td style={{ color: r.error ? "#f87171" : "white" }}>
                  {r.error || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}