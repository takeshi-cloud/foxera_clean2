"use client";

import Link from "next/link";
import { useState } from "react";

export default function PivotResearchPage() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");

  return (
    <>
      <Link href="/">
        <div style={{
          position: "fixed",
          top: 16,
          left: 16,
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
        }}>
          ⬅ HOME
        </div>
      </Link>

      <div style={{
        padding: "80px 40px",
        color: "white",
        minHeight: "100vh",
        background: "#020617",
      }}>
        <h1>🧠 PIVOT研究所</h1>

        {/* タイプ選択 */}
        <div style={{ marginTop: 20 }}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="daily">DAILY</option>
            <option value="weekly">WEEKLY</option>
          </select>
        </div>

        {/* 日付選択 */}
        <div style={{ marginTop: 10 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* 実行ボタン */}
        <button
          onClick={async () => {
            const res = await fetch("/api/pivot/update", {
              method: "POST",
              body: JSON.stringify({ type, date }),
            });

            await res.json();
            alert("PIVOT作成完了");
          }}
          style={{
            marginTop: 20,
            padding: "14px 24px",
            background: "#2563eb",
            color: "white",
            borderRadius: "10px",
          }}
        >
          🔄 実行
        </button>
      </div>
    </>
  );
}