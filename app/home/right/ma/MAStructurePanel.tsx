"use client";

import { useEffect, useState } from "react";

export function MAStructurePanel({
  activePair,
}: {
  activePair: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [baseTime, setBaseTime] = useState("");

  const loadLatest = async () => {
    try {
      const res = await fetch("/api/ma/latest");
      const json = await res.json();

      setRows(json.rows || []);
      setBaseTime(json.baseTime || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLatest();

    const handleLoadMA = async () => {
      await loadLatest();
    };

    window.addEventListener("load-ma", handleLoadMA);

    return () => {
      window.removeEventListener("load-ma", handleLoadMA);
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "5px 10px",
        background: "#0f172a",
        minHeight: 360,
        maxHeight: 800,
        overflowY: "auto",
      }}
    >

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {rows.map((row) => (
          <MAListRow
            key={row.pair}
            row={row}
            activePair={activePair} // ← ここだけ追加
          />
        ))}
      </div>
    </div>
  );
}

function MAListRow({
  row,
  activePair,
}: {
  row: any;
  activePair: string;
}) {
  // 🔥 normalize（/問題対策）
 const normalize = (p: any) =>
  String(p ?? "").replace("/", "");

  const isActive =
    normalize(row.pair) === normalize(activePair);

  if (!row.structure_order) {
    return (
      <div
        style={{
          background: "#7f1d1d",
          color: "white",
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        {row.pair} : ERROR
      </div>
    );
  }

  const slopeMap: Record<string, string> = {
    "15M":
      row.ma_now_15 > row.ma_prev_15
        ? "⇧"
        : "⇩",
    "1H":
      row.ma_now_1h > row.ma_prev_1h
        ? "⇧"
        : "⇩",
    "4H":
      row.ma_now_4h > row.ma_prev_4h
        ? "⇧"
        : "⇩",
  };

  const ordered = [...row.structure_order].reverse();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        alignItems: "center",
        gap: 10,

        background: "#020617", // ← カードと統一

        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 16,

        border: isActive
          ? "2px solid #ff00cc"
          : "1px solid #1e293b",

        boxShadow: isActive
          ? "0 0 0 2px #ff00cc, 0 0 16px #ff00cc"
          : "none",

        transform: isActive
          ? "scale(1.01)"
          : "scale(1)",

        zIndex: isActive ? 10 : 1,

        transition: "all 0.2s ease",
      }}
    >
      {/* ペア */}
      <div
        style={{
          fontWeight: "bold",
          color: isActive ? "#ff00cc" : "white",
        }}
      >
        {row.pair}
      </div>

      {/* 構造 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
        }}
      >
        {ordered.map((item: string, index: number) => {
          if (item === "PRICE") {
            return (
              <span
                key={item}
                style={{
                  color: "#60a5fa",
                  fontWeight: "bold",
                }}
              >
                PRICE
                {index < ordered.length - 1 && " <"}
              </span>
            );
          }

          return (
            <span key={item} style={{ color: "white" }}>
              {item}
              <span
                style={{
                  color:
                    slopeMap[item] === "⇧"
                      ? "#4ade80"
                      : "#f87171",
                  fontWeight: "bold",
                }}
              >
                {" "}
                {slopeMap[item]}
              </span>
              {index < ordered.length - 1 && " <"}
            </span>
          );
        })}
      </div>
    </div>
  );
}