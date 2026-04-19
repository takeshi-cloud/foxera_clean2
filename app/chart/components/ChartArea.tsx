"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  merged?: any[];
  showLine: boolean;
  setShowLine: (v: boolean) => void;
  showZigzag: boolean;
  setShowZigzag: (v: boolean) => void;
  zigzagDeviation: number;
  setZigzagDeviation: (v: number) => void;
  zigzagDepth: number;
  setZigzagDepth: (v: number) => void;
};

export const ChartArea = ({
  merged = [],
  showLine,
  setShowLine,
  showZigzag,
  setShowZigzag,
  zigzagDeviation,
  setZigzagDeviation,
  zigzagDepth,
  setZigzagDepth,
}: Props) => {
  console.log("✅ ChartArea rendered");

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* ============================= */}
      {/* 設定パネル＋チャート領域 */}
      {/* ============================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        {/* 設定パネル */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            background: "#222",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
          }}
        >
          <button
            onClick={() => setShowLine(!showLine)}
            style={{
              marginRight: 10,
              padding: "4px 8px",
              background: showLine ? "#4da6ff" : "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: 4,
            }}
          >
            ライン
          </button>

          <button
            onClick={() => setShowZigzag(!showZigzag)}
            style={{
              padding: "4px 8px",
              background: showZigzag ? "#ffcc00" : "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: 4,
            }}
          >
            ZIGZAG
          </button>

          <div style={{ marginTop: 10 }}>
            <label>乖離率(%)</label>
            <input
              type="number"
              step="0.01"
              value={zigzagDeviation}
              onChange={(e) =>
                setZigzagDeviation(Number(e.target.value))
              }
              style={{ width: 60, marginLeft: 5 }}
            />

            <label style={{ marginLeft: 10 }}>深さ</label>
            <input
              type="number"
              value={zigzagDepth}
              onChange={(e) =>
                setZigzagDepth(Number(e.target.value))
              }
              style={{ width: 60, marginLeft: 5 }}
            />
          </div>
        </div>

        {/* ============================= */}
        {/* Chart */}
        {/* ============================= */}
        <ResponsiveContainer
          width="100%"
          height={600}
        >
          <LineChart data={merged}>
            <CartesianGrid stroke="#555" />

            <XAxis
              dataKey="time"
              stroke="#aaa"
              tickFormatter={(value) => {
                const date = new Date(value);
                const hour = date.getHours();
                const day = date.getDate();

                if (hour === 0) return `${day}日`;

                return `${String(hour).padStart(
                  2,
                  "0"
                )}:00`;
              }}
            />

            <YAxis domain={["auto", "auto"]} />

            <Tooltip />

            {showLine && (
              <Line
                dataKey="price"
                stroke="#4da6ff"
                strokeWidth={2}
                dot={false}
              />
            )}

            {showZigzag && (
              <Line
                dataKey="zigzag"
                stroke="#ffcc00"
                strokeWidth={3}
                dot
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ============================= */}
      {/* 日付レイヤー */}
      {/* ============================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 20,
          marginTop: -15,
        }}
      >
        {merged.map((d, i) => {
          const date = new Date(d.time);
          const day = date.getDate();

          if (i > 0) {
            const prev = new Date(merged[i - 1].time);
            if (prev.getDate() === day) return null;
          }

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(i / Math.max(merged.length, 1)) * 100}%`,
                transform: "translateX(-50%)",
                color: "#ccc",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {day}日
            </div>
          );
        })}
      </div>
    </div>
  );
};