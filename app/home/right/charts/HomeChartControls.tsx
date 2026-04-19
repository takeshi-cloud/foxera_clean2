"use client";

import { MARKETS } from "@/lib/constants/markets";

type Props = {
  symbol: string;
  tf: string;
  startDate: string;
  endDate: string;
  showLine: boolean;
  showZigzag: boolean;

  onSymbolChange: (v: string) => void;
  onTfChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onShowLineChange: (v: boolean) => void;
  onShowZigzagChange: (v: boolean) => void;

  onLoad: () => void;
};

export function HomeChartControls({
  symbol,
  tf,
  startDate,
  endDate,
  showLine,
  showZigzag,
  onSymbolChange,
  onTfChange,
  onStartDateChange,
  onEndDateChange,
  onShowLineChange,
  onShowZigzagChange,
  onLoad,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
        flexShrink: 0,
        paddingBottom: 6,
      }}
    >
      <select
        value={symbol}
        onChange={(e) =>
          onSymbolChange(
            e.target.value
          )
        }
      >
        {MARKETS.map((m) => (
          <option
            key={m.key}
            value={m.api}
          >
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={tf}
        onChange={(e) =>
          onTfChange(
            e.target.value
          )
        }
      >
        <option value="15m">
          15M
        </option>
        <option value="1h">
          1H
        </option>
        <option value="4h">
          4H
        </option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          onStartDateChange(
            e.target.value
          )
        }
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          onEndDateChange(
            e.target.value
          )
        }
      />

      <button
  onClick={onLoad}
  style={{
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "4px 5px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
  }}
>
  表示
</button>

      <label style={{ color: "#fff" }}>
  <input
    type="checkbox"
    checked={showLine}
    onChange={(e) =>
      onShowLineChange(e.target.checked)
    }
  />
  ライン
</label>

<label style={{ color: "#fff" }}>
  <input
    type="checkbox"
    checked={showZigzag}
    onChange={(e) => {
      console.log(
        "ZIGZAG checkbox changed:",
        e.target.checked
      );
      onShowZigzagChange(
        e.target.checked
      );
    }}
  />
  ZIGZAG
</label>
    </div>
  );
}