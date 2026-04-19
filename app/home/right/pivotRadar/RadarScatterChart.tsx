"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

const CHART_DOMAIN = 3.3;

const ticks = [-3, -2, -1, 0, 1, 2, 3];

const labels: Record<number, string> = {
  [-3]: "S3",
  [-2]: "S2",
  [-1]: "S1",
  [0]: "PP",
  [1]: "R1",
  [2]: "R2",
  [3]: "R3",
};

const clamp = (value: number) =>
  Math.max(-3, Math.min(3, value));

const CustomXAxisTick = ({
  x,
  y,
  payload,
}: any) => (
  <text
    x={x}
    y={y + 18}
    textAnchor="middle"
    fill="white"
    fontSize={14}
  >
    {labels[payload.value] ?? ""}
  </text>
);

const CustomYAxisTick = ({
  x,
  y,
  payload,
}: any) => {
  const important =
    payload.value === 1 ||
    payload.value === -1;

  return (
    <text
      x={x - 10}
      y={y + 5}
      textAnchor="end"
      fill={
        important
          ? "#FFD700"
          : "white"
      }
      fontSize={15}
    >
      {labels[payload.value] ?? ""}
    </text>
  );
};

let placedYs: number[] = [];

const findAvailableY = (
  targetY: number,
  minGap: number
) => {
  let candidate = targetY;

  for (let i = 0; i < 30; i++) {
    const collided =
      placedYs.some(
        (py) =>
          Math.abs(py - candidate) <
          minGap
      );

    if (!collided) break;

    const direction =
      i % 2 === 0 ? -1 : 1;

    const offset =
      Math.ceil((i + 1) / 2) *
      minGap;

    candidate =
      targetY +
      direction * offset;
  }

  candidate = Math.max(
    20,
    Math.min(430, candidate)
  );

  placedYs.push(candidate);

  return candidate;
};

const CustomLabel = (
  props: any
) => {
  const {
    x,
    y,
    value,
    viewBox,
  } = props;

  const labelY =
    findAvailableY(y,10);

  const centerX =
    (viewBox?.width ?? 400) / 2;

  const isRightSide = x > 250;

  const offsetX = 25;

  const labelX = isRightSide
  ? x + offsetX   // 右側は右へ
  : x - offsetX;  // 左側は左へ

  return (
    <>
      <line
  x1={x + 5}
  y1={y + 5}
  x2={
    isRightSide
      ? labelX - 6
      : labelX + 6
  }
  y2={labelY - 4}
  stroke="white"
  strokeWidth={1}
  opacity={0.8}
/>

      <text
  x={labelX}
  y={labelY}
  fill="white"
  fontSize={12}
  textAnchor={
    isRightSide
      ? "start"
      : "end"
  }
>
  {value}
</text>
    </>
  );
};

export const RadarScatterChart = ({
  data,
}: {
  data: any[];
}) => {
  placedYs = [];

  const clampedData = data
    .map((d) => ({
      ...d,
      x: clamp(d.x),
      y: clamp(d.y),
    }))
    .sort((a, b) => b.y - a.y);

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <ScatterChart
        margin={{
          top: 10,
          right: 20,
          bottom: 10,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#666" />

        <XAxis
          type="number"
          dataKey="x"
          ticks={ticks}
          domain={[
            -CHART_DOMAIN,
            CHART_DOMAIN,
          ]}
          tick={<CustomXAxisTick />}
        />

        <YAxis
          type="number"
          dataKey="y"
          ticks={ticks}
          domain={[
            -CHART_DOMAIN,
            CHART_DOMAIN,
          ]}
          tick={<CustomYAxisTick />}
        />

        <ReferenceLine
          x={0}
          stroke="#fff"
          strokeDasharray="4 4"
        />

        <ReferenceLine
          y={0}
          stroke="#fff"
          strokeDasharray="4 4"
        />

        <ReferenceLine
          y={1}
          stroke="#FFD700"
        />

        <ReferenceLine
          y={-1}
          stroke="#FFD700"
        />

        <ReferenceArea
          x1={2}
          x2={CHART_DOMAIN}
          y1={2}
          y2={CHART_DOMAIN}
          fill="red"
          fillOpacity={0.25}
        />

        <ReferenceArea
          x1={-CHART_DOMAIN}
          x2={-2}
          y1={-CHART_DOMAIN}
          y2={-2}
          fill="blue"
          fillOpacity={0.25}
        />

        <Scatter
          data={clampedData}
          fill="#00ffcc"
        >
          <LabelList
            dataKey="pair"
            content={
              <CustomLabel />
            }
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};