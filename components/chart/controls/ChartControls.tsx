"use client";

import {
  CHART_SYMBOLS,
  CHART_TIMEFRAMES,
} from "@/lib/constants/chartOptions";

import {
  labelStyle,
  selectStyle,
  inputStyle,
  actionButtonStyle,
  controlRowStyle,
} from "../base/chartStyles";

type Props = {
  symbol: string;
  setSymbol: (
    v: string
  ) => void;

  tf: string;
  setTf: (
    v: string
  ) => void;

  startDate: string;
  setStartDate: (
    v: string
  ) => void;

  endDate: string;
  setEndDate: (
    v: string
  ) => void;

  onLoad: () => void;
};

export default function ChartControls({
  symbol,
  setSymbol,
  tf,
  setTf,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onLoad,
}: Props) {
  return (
    <div
      style={
        controlRowStyle
      }
    >
      {/* ペア */}
      <div>
        <label
          style={
            labelStyle
          }
        >
          ペア
        </label>

        <select
          value={symbol}
          onChange={(e) =>
            setSymbol(
              e.target.value
            )
          }
          style={
            selectStyle
          }
        >
          {CHART_SYMBOLS.map(
            (s) => (
              <option
                key={s.value}
                value={
                  s.value
                }
              >
                {s.label}
              </option>
            )
          )}
        </select>
      </div>

      {/* TF */}
      <div>
        <label
          style={
            labelStyle
          }
        >
          時間足
        </label>

        <select
          value={tf}
          onChange={(e) =>
            setTf(
              e.target.value
            )
          }
          style={
            selectStyle
          }
        >
          {CHART_TIMEFRAMES.map(
            (t) => (
              <option
                key={t.value}
                value={
                  t.value
                }
              >
                {t.label}
              </option>
            )
          )}
        </select>
      </div>

      {/* 開始日 */}
      <div>
        <label
          style={
            labelStyle
          }
        >
          開始日
        </label>

        <input
          type="date"
          value={
            startDate
          }
          onChange={(e) =>
            setStartDate(
              e.target.value
            )
          }
          style={
            inputStyle
          }
        />
      </div>

      {/* 終了日 */}
      <div>
        <label
          style={
            labelStyle
          }
        >
          終了日
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(
              e.target.value
            )
          }
          style={
            inputStyle
          }
        />
      </div>

      {/* 表示 */}
      <button
        type="button"
        onClick={onLoad}
        style={
          actionButtonStyle
        }
      >
        表示
      </button>
    </div>
  );
}