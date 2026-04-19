"use client";

import { useState } from "react";

export default function NYBarsDebugPage() {
  const [data, setData] = useState<any>(null);

  const [pair, setPair] = useState("USD/JPY");
  const [dailyDate, setDailyDate] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const runDebug = async () => {
    const qs = new URLSearchParams({
      pair,
    });

    if (dailyDate) qs.append("dailyDate", dailyDate);
    if (weekStart) qs.append("weekStart", weekStart);
    if (weekEnd) qs.append("weekEnd", weekEnd);

    const res = await fetch(
      `/api/debug/ny-bars?${qs.toString()}`
    );

    const json = await res.json();

    setData(json);
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <div style={{ marginBottom: 20 }}>
        <input
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          placeholder="Pair"
        />

        <input
          type="date"
          value={dailyDate}
          onChange={(e) =>
            setDailyDate(e.target.value)
          }
        />

        <input
          type="date"
          value={weekStart}
          onChange={(e) =>
            setWeekStart(e.target.value)
          }
        />

        <input
          type="date"
          value={weekEnd}
          onChange={(e) =>
            setWeekEnd(e.target.value)
          }
        />

        <button onClick={runDebug}>
          NY Bars Debug 実行
        </button>
      </div>

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>📊 Intraday Latest 10</h2>
          <pre>
            {JSON.stringify(
              data.intraday.slice(-10),
              null,
              2
            )}
          </pre>

          <h2>🧱 NY Daily Bars</h2>
          <pre>
            {JSON.stringify(
              data.dailyBars.slice(-5),
              null,
              2
            )}
          </pre>

          <h2>📆 NY Weekly Bars</h2>
          <pre>
            {JSON.stringify(
              data.weeklyBars.slice(-5),
              null,
              2
            )}
          </pre>

          <h2>🟡 Prev Daily</h2>
          <pre>
            {JSON.stringify(
              data.prevDaily,
              null,
              2
            )}
          </pre>

          <h2>🟡 Prev Weekly</h2>
          <pre>
            {JSON.stringify(
              data.prevWeekly,
              null,
              2
            )}
          </pre>

          <h2>Pivot Daily</h2>
          <pre>
            {JSON.stringify(
              data.pivotDaily,
              null,
              2
            )}
          </pre>

          <h2>Pivot Weekly</h2>
          <pre>
            {JSON.stringify(
              data.pivotWeekly,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}