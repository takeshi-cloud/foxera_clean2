"use client";

import {
  toggleButtonStyle,
  miniInputStyle,
  toggleRowStyle,
} from "../base/chartStyles";

type Props = {
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

export default function ChartToggles({
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
}: Props) {
  return (
    <div
      style={
        toggleRowStyle
      }
    >
      {/* Toggle Buttons */}
      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems:
            "center",
          flexWrap:
            "wrap",
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
            ...toggleButtonStyle,
            background:
              showLine
                ? "#4da6ff"
                : "#2a2a2a",
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
            ...toggleButtonStyle,
            background:
              showZigzag
                ? "#ffcc00"
                : "#2a2a2a",
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
            ...toggleButtonStyle,
            background:
              showFib
                ? "#00bcd4"
                : "#2a2a2a",
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
            ...toggleButtonStyle,
            background:
              showPivot
                ? "#a855f7"
                : "#2a2a2a",
          }}
        >
          PIVOT
        </button>
      </div>

      {/* ZigZag Params */}
      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: 6,
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
            ...miniInputStyle,
            width: 52,
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
            ...miniInputStyle,
            width: 38,
          }}
        />
      </div>
    </div>
  );
}