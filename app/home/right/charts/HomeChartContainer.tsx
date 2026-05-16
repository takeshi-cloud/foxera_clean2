"use client";

import {
   ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type Props = {
  merged: any[];
  showLine: boolean;
  showZigzag: boolean;
  dowLines: any[];
};

export function HomeChartContainer({
  merged,
  showLine,
  showZigzag,
   dowLines, // ←追加
}: Props) {

 if (!merged || merged.length === 0) {
    return (
      <div
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
        }}
      >
        Waiting chart data...
      </div>
    );
  }


  // =============================
  // 🎯 JST変換（安定版）
  // =============================
  const toJSTHour = (time: string) => {
    const d = new Date(time);
    return (d.getUTCHours() + 9) % 24;
  };

  const toJSTDate = (time: string) => {
    const d = new Date(time);
    d.setHours(d.getHours() + 9);
    return d.getDate();
  };
  // =============================
  // 🎯 CustomTick
  // =============================
  const CustomTick = ({ x, y, payload }: any) => {
    const h = toJSTHour(payload.value);
    const day = toJSTDate(payload.value);

    const showHour = h === 8 || h === 20;
    const showDay = h === 0;

    return (
      <g transform={`translate(${x},${y})`}>
        {/* 上段：時間 */}
        {showHour && (
          <text
            y={0}
            dy={10}
            textAnchor="middle"
            fill="#ddd"
            fontSize={12}
            fontWeight={600}
          >
            {h.toString().padStart(2, "0")}
          </text>
        )}

        {/* 下段：日付 */}
        {showDay && (
          <text
            y={0}
            dy={24}
            textAnchor="middle"
            fill="#777"
            fontSize={11}
          >
            {day}日
          </text>
        )}
      </g>
    );
  };

  return (
<div
  style={{
    width: 1000,
    height: 400,
    minWidth: 1000,
    overflow: "hidden",
  }}
>
<ResponsiveContainer
  width="100%"
  height={400}
>
  <LineChart
    data={merged}
          margin={{
            top: 0,
            right: 15,
            left: 10,
            bottom: 10,
          }}
        >
          {/* グリッド */}
          <CartesianGrid stroke="#444" vertical={false} />

          {/* X軸 */}
          <XAxis
            dataKey="time"
            type="category"
            interval={0}
            tickLine={false}
            ticks={merged
              .filter((d) => {
                const h = toJSTHour(d.time);
                return h === 0 || h === 8 || h === 20;
              })
              .map((d) => d.time)}
            tick={<CustomTick />}
          />

          {/* 日付の縦線 */}
          {merged.map((d, i) => {
            const h = toJSTHour(d.time);
            if (h === 0) {
              return (
                <ReferenceLine
                  key={i}
                  x={d.time}
                  stroke="#666"
                  strokeWidth={1.5}
                />
              );
            }
            return null;
          })}

          <YAxis domain={["auto", "auto"]} width={50} />
          <ReferenceLine y={1.64} stroke="red" />

          {/* 🔥 ここに追加 */}
{dowLines.map((line, i) => {
  const startTime = line.time;

  return (
    <Line
      key={`dow-${i}`}
      type="linear"
      dataKey={(d) => {
        if (!startTime) return null;

        return new Date(d.time) >= new Date(startTime)
          ? line.price
          : null;
      }}
      stroke={
        line.type === "trendBreakUp"
          ? "#00ff00"
          : "#ff0000"
      }
      strokeWidth={2}
      dot={false}
      connectNulls
    />
  );
})}


          {showLine && (
            <Line
              type="linear"
              dataKey="price"
              stroke="#4da6ff"
              dot={false}
              strokeWidth={2}
            />
          )}

          {showZigzag && (
            <Line
              type="linear"
              dataKey="zigzag"
              stroke="#FFD700"
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          )}
        </LineChart>
</ResponsiveContainer>
    </div>
  );
}