"use client";

import {
  CHART_SYMBOLS,
  CHART_TIMEFRAMES,
} from "@/lib/constants/chartOptions";

export const ChartControls = ({
  symbol,
  setSymbol,
  tf,
  setTf,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onLoad,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        marginBottom: "16px",
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      {/* ペア */}
      <div>
        <label style={label}>ペア</label>
        <br />
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={selectStyle}
        >
          {CHART_SYMBOLS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* TF */}
      <div>
        <label style={label}>時間足</label>
        <br />
        <select
          value={tf}
          onChange={(e) => setTf(e.target.value)}
          style={selectStyle}
        >
          {CHART_TIMEFRAMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* 開始日 */}
      <div>
        <label style={label}>開始日</label>
        <br />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 終了日 */}
      <div>
        <label style={label}>終了日</label>
        <br />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ボタン */}
      <button onClick={onLoad} style={buttonStyle}>
        表示
      </button>
    </div>
  );
};

// ================= STYLE =================

const label = {
  fontSize: "12px",
  color: "#94a3b8",
};

const selectStyle = {
  padding: "6px 10px",
  background: "#1e293b",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #334155",
};

const inputStyle = {
  padding: "6px 10px",
  background: "#1e293b",
  color: "white",
  borderRadius: "6px",
  border: "1px solid #334155",
};

const buttonStyle = {
  padding: "8px 16px",
  background: "#3b82f6",
  color: "white",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
};