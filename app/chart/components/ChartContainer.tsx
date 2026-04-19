"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { DateLayer } from "../components/DateLayer";

export function ChartContainer({ merged, showLine, showZigzag }) {
  
  return (
    <div>
      <LineChart width={1400} height={600} data={merged}>
        <CartesianGrid stroke="#444" />
        <XAxis dataKey="time" hide />
        <YAxis domain={["auto", "auto"]} />

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
            stroke="#ff4d4d"
            dot={false}
            strokeWidth={2}
          />
        )}
      </LineChart>

      <DateLayer merged={merged} />
    </div>
  );
}
