"use client";

import { useState, useEffect } from "react";
import { MARKETS } from "../../../lib/constants/markets";
import { useRouter } from "next/navigation";

const TIMEFRAMES = ["15min", "1h", "4h"];

// 前
function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// 後（共通）
function addDaysBack(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// 月
function addMonthsBack(date: string, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export default function FetchPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([
    {
      pair: "USD/JPY",
      timeframe: "1h",
      from: "2026-01-01",
      to: addDays("2026-01-01", 20),
      status: "idle",
    },
    {
      pair: "USD/JPY",
      timeframe: "4h",
      from: "2026-01-01",
      to: addDays("2026-01-01", 80),
      status: "idle",
    },
    {
      pair: "USD/JPY",
      timeframe: "15min",
      from: "2026-01-01",
      to: addDays("2026-01-01", 5),
      status: "idle",
    },
  ]);

  const [range, setRange] = useState<any[]>([]);

  // 日・週・月 共通日付
  const [baseDate, setBaseDate] = useState("2026-04-01");

  const [dailyStatus, setDailyStatus] = useState("idle");
  const [weeklyStatus, setWeeklyStatus] = useState("idle");
  const [monthlyStatus, setMonthlyStatus] = useState("idle");

  // --------------------------
  const runTask = async (i: number) => {
    const t = [...tasks];
    t[i].status = "running";
    setTasks(t);

    await fetch("/api/market/ingest", {
      method: "POST",
      body: JSON.stringify(t[i]),
    });

    t[i].status = "done";
    setTasks([...t]);

    loadRange();
  };

  // --------------------------
  // 日足（10日）
  // --------------------------
  const runDaily = async () => {
    setDailyStatus("running");

    const from = addDaysBack(baseDate, 10);
    const to = baseDate;

    for (const m of MARKETS) {
      await fetch("/api/market/ingest", {
        method: "POST",
        body: JSON.stringify({
          pair: m.api,
          timeframe: "1day",
          from,
          to,
        }),
      });
    }

    setDailyStatus("done");
    loadRange();
  };

  // --------------------------
  // 週足（5週）
  // --------------------------
  const runWeekly = async () => {
    setWeeklyStatus("running");

    const from = addDaysBack(baseDate, 35); // 5週
    const to = baseDate;

    for (const m of MARKETS) {
      await fetch("/api/market/ingest", {
        method: "POST",
        body: JSON.stringify({
          pair: m.api,
          timeframe: "1week",
          from,
          to,
        }),
      });
    }

    setWeeklyStatus("done");
    loadRange();
  };

  // --------------------------
  // 月足（6ヶ月）
  // --------------------------
  const runMonthly = async () => {
    setMonthlyStatus("running");

    const from = addMonthsBack(baseDate, 6);
    const to = baseDate;

    for (const m of MARKETS) {
      await fetch("/api/market/ingest", {
        method: "POST",
        body: JSON.stringify({
          pair: m.api,
          timeframe: "1month",
          from,
          to,
        }),
      });
    }

    setMonthlyStatus("done");
    loadRange();
  };

  // --------------------------
  const setDays = (i: number, days: number) => {
    const t = [...tasks];
    t[i].to = addDays(t[i].from, days);
    setTasks(t);
  };

  // --------------------------
  const loadRange = async () => {
    const res = await fetch("/api/debug/range");
    const data = await res.json();
    setRange(data);
  };

  useEffect(() => {
    loadRange();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#08080a", color: "white", padding: 20 }}>
      <button onClick={() => router.push("/")} style={{ fontSize: 25 }}>
        🏠 HOME
      </button>

      <h2>📦 Market Fetch</h2>

      {/* 通常BOX */}
      {tasks.map((task, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <select
            value={task.pair}
            onChange={(e) => {
              const t = [...tasks];
              t[i].pair = e.target.value;
              setTasks(t);
            }}
          >
            {MARKETS.map((m) => (
              <option key={m.label} value={m.api}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={task.timeframe}
            onChange={(e) => {
              const t = [...tasks];
              t[i].timeframe = e.target.value;
              setTasks(t);
            }}
          >
            {TIMEFRAMES.map((tf) => (
              <option key={tf}>{tf}</option>
            ))}
          </select>

          <input type="date" value={task.from} onChange={(e) => {
            const t = [...tasks];
            t[i].from = e.target.value;
            setTasks(t);
          }} />

          <input type="date" value={task.to} onChange={(e) => {
            const t = [...tasks];
            t[i].to = e.target.value;
            setTasks(t);
          }} />

          <button onClick={() => setDays(i, 5)}>5日</button>
          <button onClick={() => setDays(i, 20)}>20日</button>
          <button onClick={() => setDays(i, 80)}>80日</button>

          <button onClick={() => runTask(i)}>実行</button>

          <span>
            {task.status === "idle" && "⚪"}
            {task.status === "running" && "🟡"}
            {task.status === "done" && "🟢"}
          </span>
        </div>
      ))}

      {/* 🔥 共通日付 */}
      <div style={{ marginTop: 20 }}>
        <h3>📅 基準日</h3>
        <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
      </div>

      {/* 🔥 横並び */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>

        <div>
          <h3>日足（10日）</h3>
          <button onClick={runDaily}>実行</button>
          <div>{dailyStatus}</div>
        </div>

        <div>
          <h3>週足（5週）</h3>
          <button onClick={runWeekly}>実行</button>
          <div>{weeklyStatus}</div>
        </div>

        <div>
          <h3>月足（6ヶ月）</h3>
          <button onClick={runMonthly}>実行</button>
          <div>{monthlyStatus}</div>
        </div>

      </div>

      <h3 style={{ marginTop: 30 }}>📊 取得済み</h3>
      <div>
        {range.map((r, i) => (
          <div key={i}>
            {r.symbol} / {r.timeframe} : {r.min} ～ {r.max} ({r.count})
          </div>
        ))}
      </div>
    </div>
  );
}