"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("2026-04-07");

  // ===============================
  // 週の開始（日曜）
  // ===============================
  function getWeekStart(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00Z");
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function getPrevWeekStart(dateStr: string) {
    const d = new Date(getWeekStart(dateStr) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 7);
    return d.toISOString().slice(0, 10);
  }

  // ===============================
  // 前営業日（土日スキップ）
  // ===============================
  function getPrevTradingDay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00Z");

    while (true) {
      d.setUTCDate(d.getUTCDate() - 1);
      const day = d.getUTCDay();

      if (day !== 0 && day !== 6) {
        return d.toISOString().slice(0, 10);
      }
    }
  }

  // ===============================
  // NY時間（UTC 21:00）
  // ===============================
  function getNYDailyRange(dateStr: string) {
    const end = new Date(dateStr + "T21:00:00Z");
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 1);
    return { start, end };
  }

  function getNYWeeklyRange(weekStart: string) {
    const start = new Date(weekStart + "T21:00:00Z");
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 5); // 金曜まで
    return { start, end };
  }

  // ===============================
  // 計算
  // ===============================
  const weekStart = getWeekStart(input);
  const prevWeekStart = getPrevWeekStart(input);

  // 🔥 ここが重要（前営業日）
  const prevTradingDay = getPrevTradingDay(input);

  const dailyNY = getNYDailyRange(prevTradingDay);
  const weeklyNY = getNYWeeklyRange(prevWeekStart);

  // ===============================
  // 表示用
  // ===============================
  function fmt(d: Date) {
    return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>🔥 Pivot Debug（修正版）</h1>

      <input
        type="date"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ fontSize: 16, padding: 5 }}
      />

      <hr />

      <h2>📅 Week Info</h2>
      <p>入力日: {input}</p>
      <p>今週開始: {weekStart}</p>
      <p>先週開始: {prevWeekStart}</p>

      <hr />

      <h2>📊 Daily Pivot（前営業日）</h2>
      <p>前営業日: {prevTradingDay}</p>
      <p>開始: {fmt(dailyNY.start)}</p>
      <p>終了: {fmt(dailyNY.end)}</p>

      <hr />

      <h2>📊 Weekly Pivot（先週）</h2>
      <p>開始: {fmt(weeklyNY.start)}</p>
      <p>終了: {fmt(weeklyNY.end)}</p>

      <hr />

      <h2>🧪 Check</h2>
      <p>✔ 月曜 → 金曜にジャンプしているか？</p>
      <p>✔ Dailyが1日前になっているか？</p>
      <p>✔ 土日が含まれていないか？</p>
    </div>
  );
}