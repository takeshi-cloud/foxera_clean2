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

  // =========================================
  // 🔥 追加：並び替え
  // =========================================
  const sortedRows = [...rows].sort((a, b) => {
    const dirOrder: Record<string, number> = {
      UP: 0,
      DOWN: 1,
      OTHER: 2,
    };

    const d1 = dirOrder[a.direction] ?? 2;
    const d2 = dirOrder[b.direction] ?? 2;

    if (d1 !== d2) {
      return d1 - d2;
    }

    return (b.stars || 0) - (a.stars || 0);
  });

  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "2px 2px",
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
          gap: 1,
        }}
      >
        {/* 🔥 ここ変更 */}
        {sortedRows.map((row) => (
          <MAListRow
            key={row.pair}
            row={row}
            activePair={activePair}
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
          padding: "8px 5px",
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
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "2px 2px",
        fontSize: 13,

        background: "#020617",
        borderRadius: 6,

        border: isActive
          ? "2px solid #ff00cc"
          : "1px solid #1e293b",

        boxShadow: isActive
          ? "0 0 0 2px #ff00cc, 0 0 16px #ff00cc"
          : "none",

        transform: isActive ? "scale(1.01)" : "scale(1)",
        zIndex: isActive ? 10 : 1,
      }}
    >
      {/* ペア */}
      <div
        style={{
          minWidth: 70,
          fontWeight: "bold",
          color: isActive ? "#ff00cc" : "white",
        }}
      >
        {row.pair}
      </div>

      {/* 構造 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "nowrap",
          gap: 10,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {ordered.map((item: string, index: number) => {
          if (item === "PRICE") {
            return (
              <span key={item} style={{ color: "#60a5fa", fontWeight: "bold" }}>
                PRICE{index < ordered.length - 1 && " <"}
              </span>
            );
          }

          return (
            <span
              key={item}
              style={{
                color: "#e2e8f0",
              }}
            >
              {item}
              <span
                style={{
                  color:
                    slopeMap[item] === "⇧"
                      ? "#4ade80"
                      : "#f87171",
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

      {/* 状態 */}
      {row.direction !== "OTHER" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "20px 24px 70px",
            alignItems: "center",
            marginLeft: 1,
          }}
        >
          <span
            style={{
              color:
                row.direction === "UP"
                  ? "#22c55e"
                  : "#ef4444",
              fontWeight: "bold",
            }}
          >
            {row.direction === "UP" ? "⤴" : "⤵"}
          </span>

          <span>
            {row.phase === "TREND" ? "🚀" : "↩️"}
          </span>

          <span style={{ color: "#facc15" }}>
            {"★".repeat(row.stars || 0)}
          </span>
        </div>
      )}
    </div>
  );
}