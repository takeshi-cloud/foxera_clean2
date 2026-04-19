"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Props = {
  merged: any[];
  showLine: boolean;
  showZigzag: boolean;
};

export function HomeChartContainer({
  merged,
  showLine,
  showZigzag,
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={merged}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid stroke="#444" />

          <XAxis
            dataKey="time"
            hide
          />

          <YAxis
            domain={["auto", "auto"]}
            width={50}
          />

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