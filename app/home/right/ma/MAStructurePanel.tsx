"use client";

import { useEffect, useState } from "react";

export function MAStructurePanel() {
  const [rows, setRows] =
    useState<any[]>([]);

  const [baseTime, setBaseTime] =
    useState("");

  const loadLatest = async () => {
    try {
      const res = await fetch(
        "/api/ma/latest"
      );

      const json =
        await res.json();

      setRows(json.rows || []);
      setBaseTime(
        json.baseTime || ""
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLatest();

    const handleLoadMA =
      async () => {
        await loadLatest();
      };

    window.addEventListener(
      "load-ma",
      handleLoadMA
    );

    return () => {
      window.removeEventListener(
        "load-ma",
        handleLoadMA
      );
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 10,
        background: "#0f172a",
        minHeight: 360,
        maxHeight: 800,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: 4,
          fontSize: 14,
          color: "white",
        }}
      >
        MA Structure
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 10,
        }}
      >
        更新時刻：
        {baseTime
          ? new Date(
              baseTime
            ).toLocaleString(
              "ja-JP"
            )
          : "-"}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {rows.map((row) => (
          <MAListRow
            key={row.pair}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

function MAListRow({
  row,
}: {
  row: any;
}) {
  if (!row.structure_order) {
    return (
      <div
        style={{
          background:
            "#7f1d1d",
          color: "white",
          padding:
            "8px 10px",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        {row.pair} : ERROR
      </div>
    );
  }

  const slopeMap: Record<
    string,
    string
  > = {
    "15M":
      row.ma_now_15 >
      row.ma_prev_15
        ? "⇧"
        : "⇩",

    "1H":
      row.ma_now_1h >
      row.ma_prev_1h
        ? "⇧"
        : "⇩",

    "4H":
      row.ma_now_4h >
      row.ma_prev_4h
        ? "⇧"
        : "⇩",
  };

  const ordered = [
    ...row.structure_order,
  ].reverse();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "72px 1fr",
        alignItems: "center",
        gap: 10,
        background: "#1e293b",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 16,
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          color: "white",
        }}
      >
        {row.pair}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
        }}
      >
        {ordered.map(
          (
            item: string,
            index: number
          ) => {
            if (
              item === "PRICE"
            ) {
              return (
                <span
                  key={item}
                  style={{
                    color:
                      "#60a5fa",
                    fontWeight:
                      "bold",
                  }}
                >
                  PRICE
                  {index <
                    ordered.length -
                      1 &&
                    " <"}
                </span>
              );
            }

            return (
              <span
                key={item}
                style={{
                  color:
                    "white",
                }}
              >
                {item}
                <span
                  style={{
                    color:
                      slopeMap[
                        item
                      ] ===
                      "⇧"
                        ? "#4ade80"
                        : "#f87171",
                    fontWeight:
                      "bold",
                  }}
                >
                  {" "}
                  {
                    slopeMap[
                      item
                    ]
                  }
                </span>
                {index <
                  ordered.length -
                    1 &&
                  " <"}
              </span>
            );
          }
        )}
      </div>
    </div>
  );
}