"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  merged?: any[];
  fibData?: any;
  zigzagData?: any[];
  selectedZigzagIndex?: number;
  setSelectedZigzagIndex?: (v: number) => void;
  showLine: boolean;
  showZigzag: boolean;
  showFib: boolean;
  showPivot: boolean;
  dowLines: any[];
  width?: number;
  height?: number;
};

export default function ChartRender({
  merged = [],
  fibData,
  zigzagData = [],
  selectedZigzagIndex,
  setSelectedZigzagIndex,
  showLine,
  showZigzag,
  showFib,
  showPivot,
  dowLines,
  width = 900,
  height = 600,
}: Props) {
  const FIB_LABELS = [
    "0.618",
    "1",
    "1.618",
    "2.618",
    "3.618",
    "4.618",
  ];

  return (
    <LineChart
      width={width}
      height={height}
      data={merged}
      onClick={(state: any) => {
        const idx = state?.activeTooltipIndex;

        console.log("🔥 CLICK IDX", idx);

        if (idx == null || !setSelectedZigzagIndex) return;

        const nearest = zigzagData.reduce((best, z, i) => {
          const dist = Math.abs(z.idx - idx);

          return dist < best.dist
            ? { index: i, dist }
            : best;
        }, {
          index: -1,
          dist: Infinity,
        });

        console.log("🔥 NEAREST", nearest);

        if (nearest.dist > 2) {
          console.log("❌ TOO FAR");
          return;
        }

        setSelectedZigzagIndex(nearest.index);
      }}
    >
      <CartesianGrid stroke="#555" />

      <XAxis
        dataKey="time"
        stroke="#aaa"
        tickFormatter={(value) => {
          const date = new Date(value);
          const hour = date.getHours();
          const day = date.getDate();

          if (hour === 0) return `${day}日`;

          return `${String(hour).padStart(2, "0")}:00`;
        }}
      />

      <YAxis domain={["auto", "auto"]} />

      {/* ============================= */}
      {/* FIB */}
      {/* ============================= */}

      {showFib &&
        fibData?.valid &&
        fibData.levels?.map((level: number, i: number) => (
          <ReferenceLine
            key={`fib-${i}`}
            y={level}
            stroke="#00ffff"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            label={(props) => {
              const { viewBox } = props;

              return (
                <text
                  x={viewBox.x + viewBox.width - 40}
                  y={viewBox.y - 4}
                  fill="#00ffff"
                  fontSize={11}
                >
                  {FIB_LABELS[i]}
                </text>
              );
            }}
          />
        ))}

      <Tooltip
        cursor={{
          stroke: "#666",
          strokeWidth: 1,
        }}
        contentStyle={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "2px 6px",
          color: "white",
          backdropFilter: "blur(4px)",
          boxShadow: "none",
        }}
        itemStyle={{
          color: "white",
          fontSize: 11,
          padding: 0,
          margin: 0,
        }}
        labelStyle={{ display: "none" }}
        wrapperStyle={{ opacity: 0.8 }}
      />

      {/* ============================= */}
      {/* PRICE */}
      {/* ============================= */}

      {showLine && (
        <Line
          dataKey="price"
          stroke="#4da6ff"
          strokeWidth={2}
          dot={false}
        />
      )}

      {/* ============================= */}
      {/* ZIGZAG */}
      {/* ============================= */}

      {showZigzag && (
        <Line
          dataKey="zigzag"
          stroke="#ffcc00"
          strokeWidth={3}
          connectNulls
          dot={(props: any) => {
            const { cx, cy, payload } = props;

            if (!payload?.zigzag) return null;

            let fill = "#ffcc00";

            if (fibData?.a?.idx === payload.idx) fill = "red";
            if (fibData?.b?.idx === payload.idx) fill = "lime";
            if (fibData?.c?.idx === payload.idx) fill = "red";

            return (
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={fill}
                stroke="white"
                strokeWidth={1.5}
              />
            );
          }}
        />
      )}

{/* ============================= */}
{/* DOW */}
{/* ============================= */}

{dowLines?.map((line, i) => {
  const startTime =
    line.time;

  const endTime =
    line.endTime;

  return (
    <Line
      key={`dow-${i}`}
      type="linear"
      dataKey={(d) => {
        if (!startTime)
          return null;

        const current =
          new Date(
            d.time
          );

        const started =
          current >=
          new Date(
            startTime
          );

        const notEnded =
          !endTime ||
          current <=
            new Date(
              endTime
            );

        return started &&
          notEnded
          ? line.price
          : null;
      }}
      stroke={
        line.type ===
        "trendBreakUp"
          ? "#00ff00"
          : "#ff0000"
      }
      strokeWidth={2}
      dot={false}
      connectNulls
    />
  );
})}
    </LineChart>
  );
}