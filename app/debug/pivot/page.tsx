"use client";

import { useState } from "react";

export default function PivotDebugPage() {
  const [data, setData] = useState<any>(null);

  const [pair, setPair] = useState("USD/JPY");
  const [dailyDate, setDailyDate] =
    useState("");
  const [weekStart, setWeekStart] =
    useState("");
  const [weekEnd, setWeekEnd] =
    useState("");

  const runDebug = async () => {
    const qs = new URLSearchParams({
      pair,
    });

    if (dailyDate)
      qs.append("dailyDate", dailyDate);

    if (weekStart)
      qs.append("weekStart", weekStart);

    if (weekEnd)
      qs.append("weekEnd", weekEnd);

    // =========================
    // Front送信確認ログ
    // =========================
    console.log("DEBUG SEND PARAMS", {
      pair,
      dailyDate,
      weekStart,
      weekEnd,
      queryString: qs.toString(),
    });

    const res = await fetch(
      `/api/debug/pivot?${qs.toString()}`
    );

    const json = await res.json();

    console.log("DEBUG RESPONSE", json);

    setData(json);
  };

  const Section = ({
    title,
    color = "white",
    children,
  }: {
    title: string;
    color?: string;
    children: React.ReactNode;
  }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color }}>{title}</h2>
      {children}
    </div>
  );

  const JsonBlock = ({
    value,
  }: {
    value: any;
  }) => (
    <pre
      style={{
        background: "#111",
        padding: 12,
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 13,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        background: "#000",
        minHeight: "100vh",
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <input
          value={pair}
          onChange={(e) =>
            setPair(e.target.value)
          }
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
          デバッグ実行
        </button>
      </div>

      {/* 入力確認表示 */}
      <Section
        title="📥 Current Input State"
        color="#7fffd4"
      >
        <JsonBlock
          value={{
            pair,
            dailyDate,
            weekStart,
            weekEnd,
          }}
        />
      </Section>

      {/* Debug Output */}
      {data && (
        <>
          <Section
            title="📨 API Input Received"
            color="#00ff99"
          >
            <JsonBlock
              value={data.input}
            />
          </Section>

          <Section
            title="📌 Summary"
            color="#00d8ff"
          >
            <JsonBlock
              value={{
                price: data.price,
                prevDaily:
                  data.prevDaily,
                prevWeekly:
                  data.prevWeekly,
                pivotDaily:
                  data.pivotDaily,
                pivotWeekly:
                  data.pivotWeekly,
                radar: data.radar,
              }}
            />
          </Section>

          <Section
            title="📅 Prev Daily Source"
            color="yellow"
          >
            <JsonBlock
              value={data.prevDaily}
            />

            <h3>
              Used Intraday
              Timestamps
            </h3>

            <JsonBlock
              value={
                data.prevDailySourceIntraday ||
                []
              }
            />
          </Section>

          <Section
            title="📆 Prev Weekly Source"
            color="orange"
          >
            <JsonBlock
              value={data.prevWeekly}
            />

            <h3>
              Used NY Daily Bars
            </h3>

            <JsonBlock
              value={
                data.prevWeeklySourceDailyBars ||
                []
              }
            />

            <h3>
              Used Intraday By Day
            </h3>

            <JsonBlock
              value={
                data.prevWeeklySourceIntradayMap ||
                {}
              }
            />
          </Section>

          <Section
            title="🧱 Raw NY Daily (latest 10)"
            color="#888"
          >
            <JsonBlock
              value={
                data.dailyBars?.slice(
                  -10
                ) || []
              }
            />
          </Section>

          <Section
            title="📆 Raw NY Weekly (latest 10)"
            color="#888"
          >
            <JsonBlock
              value={
                data.weeklyBars?.slice(
                  -10
                ) || []
              }
            />
          </Section>
        </>
      )}
    </div>
  );
}