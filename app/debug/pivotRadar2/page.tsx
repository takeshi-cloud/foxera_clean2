"use client";

import { useEffect, useState } from "react";

export default function PivotRadarDebugPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("debugLogs");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setData(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("debug parse error", e);
    }
  }, []);

  const fmt = (v: any) =>
    v ? new Date(v).toISOString() : "-";

  return (
    <div className="p-4 bg-black text-xs min-h-screen font-mono text-gray-200">
      <h1 className="text-lg mb-4 text-white">
        Pivot Radar Debug
      </h1>

      {!data.length && (
        <div className="text-gray-500">
          No logs found
        </div>
      )}

      <div className="space-y-3">
        {data.map((pair, i) => {
          const d = pair.debug;
          const s = pair.summary;

          return (
            <details
              key={i}
              className="border border-gray-700 rounded p-3 bg-gray-900"
            >
              <summary className="cursor-pointer text-blue-400">
                {pair.symbol}
              </summary>

              {/* ========================= */}
              {/* ① BASE TIME（基準） */}
              {/* ========================= */}
              {d?.baseTime && (
                <div className="mt-3">
                  <div className="text-gray-400">
                    --- BASE TIME ---
                  </div>
                  <div>
                    Daily:
                    {fmt(d.baseTime.daily.start)} →
                    {fmt(d.baseTime.daily.end)}
                  </div>
                  <div>
                    Weekly:
                    {fmt(d.baseTime.weekly.start)} →
                    {fmt(d.baseTime.weekly.end)}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* ② 使用した1h範囲 */}
              {/* ========================= */}
              {d?.raw?.daily?.length > 0 && (
                <div className="mt-3">
                  <div className="text-gray-400">
                    --- DAILY 1H RANGE ---
                  </div>
                  <div>
                    count: {d.raw.daily.length}
                  </div>
                  <div>
                    start:{" "}
                    {fmt(d.raw.daily[0]?.timestamp_utc)}
                  </div>
                  <div>
                    end:{" "}
                    {fmt(
                      d.raw.daily.at(-1)?.timestamp_utc
                    )}
                  </div>
                </div>
              )}

              {d?.raw?.weekly?.length > 0 && (
                <div className="mt-3">
                  <div className="text-gray-400">
                    --- WEEKLY 1H RANGE ---
                  </div>
                  <div>
                    count: {d.raw.weekly.length}
                  </div>
                  <div>
                    start:{" "}
                    {fmt(d.raw.weekly[0]?.timestamp_utc)}
                  </div>
                  <div>
                    end:{" "}
                    {fmt(
                      d.raw.weekly.at(-1)
                        ?.timestamp_utc
                    )}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* ③ NY OHLC（生成結果） */}
              {/* ========================= */}
              {d?.ny && (
                <div className="mt-3 text-yellow-300">
                  <div>--- NY OHLC ---</div>

                  <div>
                    Daily:
                    H {d.ny.daily?.high} /
                    L {d.ny.daily?.low} /
                    C {d.ny.daily?.close}
                  </div>

                  <div>
                    Weekly:
                    H {d.ny.weekly?.high} /
                    L {d.ny.weekly?.low} /
                    C {d.ny.weekly?.close}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* ④ PIVOT値 */}
              {/* ========================= */}
              {s?.pivot && (
                <div className="mt-3 text-green-400">
                  <div>--- PIVOT ---</div>

                  <div>
                    Daily PP: {s.pivot.daily?.PP}
                  </div>

                  <div>
                    Weekly PP: {s.pivot.weekly?.PP}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* ⑤ 現在価格 */}
              {/* ========================= */}
              {s?.price && (
                <div className="mt-3 text-purple-300">
                  <div>--- PRICE ---</div>

                  <div>
                    value: {s.price.value}
                  </div>

                  <div>
                    time: {fmt(s.price.time)}
                  </div>
                </div>
              )}

              {/* ========================= */}
              {/* ⑥ 検証用（差分確認） */}
              {/* ========================= */}
              {d?.weeklyCheck && (
                <div className="mt-3 text-cyan-400">
                  <div>
                    --- WEEKLY CHECK ---
                  </div>

                  <div>
                    high: {d.weeklyCheck.high}
                  </div>
                  <div>
                    low: {d.weeklyCheck.low}
                  </div>
                  <div>
                    close: {d.weeklyCheck.close}
                  </div>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}