"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Props = {
  merged?: any[];

  fibData?: any;

  zigzagData?: any[];

  selectedZigzagIndex?: number;

  setSelectedZigzagIndex?: (
    v: number
  ) => void;

  showLine: boolean;
  setShowLine: (
    v: boolean
  ) => void;

  showZigzag: boolean;
  setShowZigzag: (
    v: boolean
  ) => void;

  zigzagDeviation: number;

  setZigzagDeviation: (
    v: number
  ) => void;

  zigzagDepth: number;

  setZigzagDepth: (
    v: number
  ) => void;

  showFib: boolean;

setShowFib: (
  v: boolean
) => void;

showPivot: boolean;

setShowPivot: (
  v: boolean
) => void;

};



export const AnalysisChartArea = ({
  merged = [],
  fibData,
  zigzagData = [],
  selectedZigzagIndex,
  setSelectedZigzagIndex,
  showLine,
  setShowLine,
  showZigzag,
  setShowZigzag,
  zigzagDeviation,
  setZigzagDeviation,
  zigzagDepth,
  setZigzagDepth,
  showFib,
setShowFib,

showPivot,
setShowPivot,
}: Props) => {
  console.log("✅ AnalysisChartArea rendered");

   const FIB_LABELS = [
  "0.618",
  "1",
  "1.618",
  "2.618",
  "3.618",
  "4.618",
];

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
           minHeight: 600,
    minWidth: 0,
        }}
      >
{/* 設定パネル */}
<div
  style={{
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 5,
    background:
      "rgba(30,30,30,0.92)",
    padding: "0px 10px",
    borderRadius: 8,
    border:
      "1px solid rgba(255,255,255,0.08)",
    backdropFilter:
      "blur(6x)",
    display: "flex",
    flexDirection:
      "column",
    gap: 3,
  }}
>
  {/* ボタン群 */}
  <div
    style={{
      display: "flex",
      gap: 6,
      alignItems: "center",
    }}
  >
    <button
      type="button"
      onClick={() =>
        setShowLine(
          !showLine
        )
      }
      style={{
        padding:
          "2px 5px",
        fontSize: 12,
        height: 25,

        background:
          showLine
            ? "#4da6ff"
            : "#333",

        color: "white",

        border:
          "1px solid #555",

        borderRadius: 6,
      }}
    >
      ライン
    </button>

    <button
      type="button"
      onClick={() =>
        setShowZigzag(
          !showZigzag
        )
      }
      style={{
        padding:
          "2px 5px",
        fontSize: 12,
        height: 25,

        background:
          showZigzag
            ? "#ffcc00"
            : "#333",

        color: "white",

        border:
          "1px solid #555",

        borderRadius: 6,
      }}
    >
      ZIGZAG
    </button>

    <button
      type="button"
      onClick={() =>
        setShowFib(
          !showFib
        )
      }
      style={{
        padding:
          "2px 5px",
        fontSize: 12,
        height: 25,

        background:
          showFib
            ? "#00ffff"
            : "#333",

        color: "white",

        border:
          "1px solid #555",

        borderRadius: 6,
      }}
    >
      FIB
    </button>

    <button
      type="button"
      onClick={() =>
        setShowPivot(
          !showPivot
        )
      }
      style={{
        padding:
          "2px 5px",
        fontSize: 12,
        height: 25,

        background:
          showPivot
            ? "#a855f7"
            : "#333",

        color: "white",

        border:
          "1px solid #555",

        borderRadius: 6,
      }}
    >
      PIVOT
    </button>
  </div>

  {/* ZigZag設定 */}
  <div
    style={{
      display: "flex",
      alignItems:
        "center",
      gap: 1,
      fontSize: 12,
      color: "#ddd",
    }}
  >
    <label>
      乖離率(%)
    </label>

    <input
      type="number"
      step="0.01"
      value={
        zigzagDeviation
      }
      onChange={(e) =>
        setZigzagDeviation(
          Number(
            e.target.value
          )
        )
      }
      style={{
        width: 60,
        height: 18,
        fontSize: 12,
        padding:
          "0px 2px",
        background:
          "#1e293b",
        border:
          "1px solid #334155",
        borderRadius: 4,
        color: "white",
      }}
    />

    <label>
      深さ
    </label>

    <input
      type="number"
      value={
        zigzagDepth
      }
      onChange={(e) =>
        setZigzagDepth(
          Number(
            e.target.value
          )
        )
      }
      style={{
        width: 40,
        height: 18,
        fontSize: 12,
        padding:
          "2px 6px",
        background:
          "#1e293b",
        border:
          "1px solid #334155",
        borderRadius: 4,
        color: "white",
      }}
    />
  </div>
</div>

{/* ============================= */}
{/* Chart */}
{/* ============================= */}

<div
  style={{
    overflowX: "auto",
    WebkitOverflowScrolling:
      "touch",
    width: "100%",
  }}
>
  <div
    style={{
      minWidth: 1200,
    }}
  >
    <ResponsiveContainer
      width="100%"
      height={600}
    >
      <LineChart
        data={merged}
        onClick={(state: any) => {
          const idx =
            state?.activeTooltipIndex;

          console.log(
            "🔥 CLICK IDX",
            idx
          );

          if (
            idx == null ||
            !setSelectedZigzagIndex
          ) {
            return;
          }

  // ==================================
  // 一番近い ZigZag 頂点
  // ==================================
  const nearest =
    zigzagData.reduce(
      (
        best,
        z,
        i
      ) => {
        const dist =
          Math.abs(
            z.idx - idx
          );

        if (
          dist <
          best.dist
        ) {
          return {
            index: i,
            dist,
          };
        }

        return best;
      },
      {
        index: -1,
        dist: Infinity,
      }
    );

  console.log(
    "🔥 NEAREST",
    nearest
  );

  // ==================================
  // 頂点近く以外無視
  // ==================================
  if (
    nearest.dist > 2
  ) {
    console.log(
      "❌ TOO FAR"
    );
    return;
  }

  setSelectedZigzagIndex(
    nearest.index
  );
}}
  >
    <CartesianGrid stroke="#555" />

    <XAxis
      dataKey="time"
      stroke="#aaa"
      tickFormatter={(value) => {
        const date =
          new Date(value);

        const hour =
          date.getHours();

        const day =
          date.getDate();

        if (hour === 0)
          return `${day}日`;

        return `${String(
          hour
        ).padStart(
          2,
          "0"
        )}:00`;
      }}
    />

    <YAxis
      domain={[
        "auto",
        "auto",
      ]}
    />

    {/* 🔥 Fib Levels */}


{fibData?.valid &&
  fibData.levels?.map(
    (
      level: number,
      i: number
    ) => (
      <ReferenceLine
        key={`fib-${i}`}
        y={level}
        stroke="#00ffff"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        label={(props) => {
          const {
            viewBox,
          } = props;

          return (
            <text
              x={
                viewBox.x +
                viewBox.width -
                40
              }
              y={
                viewBox.y -
                4
              }
              fill="#00ffff"
              fontSize={11}
            >
              {
                FIB_LABELS[
                  i
                ]
              }
            </text>
          );
        }}
      />
    )
)}



<Tooltip
  cursor={{
    stroke: "#666",
    strokeWidth: 1,
  }}
  contentStyle={{
    background:
      "rgba(0,0,0,0.25)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "2px 6px",
    color: "white",
    backdropFilter:
      "blur(4px)",
    boxShadow: "none",
  }}
  itemStyle={{
    color: "white",
    fontSize: 11,
    padding: 0,
    margin: 0,
  }}
  labelStyle={{
    display: "none",
  }}
  wrapperStyle={{
    opacity: 0.8,
  }}
/>

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
    connectNulls
    dot={(props: any) => {
      const {
        cx,
        cy,
        payload,
      } = props;

      if (
        !payload?.zigzag
      ) {
        return null;
      }

      let fill =
        "#ffcc00";

      // A
      if (
        fibData?.a?.idx ===
        payload.idx
      ) {
        fill = "red";
      }

      // B
      if (
        fibData?.b?.idx ===
        payload.idx
      ) {
        fill =
          "lime";
      }

      // C
      if (
        fibData?.c?.idx ===
        payload.idx
      ) {
        fill = "red";
      }

      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={fill}
          stroke="white"
          strokeWidth={1.5}
        />
      );
    }}
  />
)}
  </LineChart>
</ResponsiveContainer>
</div>
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
    </div>
  );
};