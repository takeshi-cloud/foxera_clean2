import { CSSProperties } from "react";

import {
  PAIRS,
  TIMEFRAMES,
  TIMEFRAME_TYPES,
  DIRECTIONS,
  PHASES,
} from "@/lib/constants/LogOptions";

// 👉 テーブル操作に必要なprops一式
type Props = {
  filtered: any[];              // 表示対象ログ
  forms: any;                  // 編集用state（idごと）
  selectedIndex: number;       // 選択中の行
  setSelectedIndex: (i: number) => void;
  updateField: (id: string, key: string, value: any) => void; // フィールド更新
  handleDelete: (s: any) => void;
  handleUpdate: (s: any) => void;
  handleReplaceImage: (e: any, s: any) => void;
};

export default function EventTable({
  filtered,
  forms,
  selectedIndex,
  setSelectedIndex,
  updateField,
  handleDelete,
  handleUpdate,
  handleReplaceImage,
}: Props) {

  // 👉 ISO文字列 → HH:mm に変換
  const formatTime = (t: string) => {
    if (!t) return "";
    return t.split("T")[1]?.slice(0, 5) || "";
  };

  // 👉 ヘッダ用スタイル
  const thStyle: CSSProperties = {
    padding: "4px 1px",
    borderBottom: "1px solid #1e293b",
    textAlign: "center",
    fontWeight: "bold",
    height: "32px",
    fontSize: "12px",
  };

  // 👉 セル共通スタイル
  const tdStyle: CSSProperties = {
    padding: "1px 1px",
    borderBottom: "1px solid #020617",
    textAlign: "center",
    height: "32px",
    whiteSpace: "nowrap",
    fontSize: "12px",
  };

  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #1e293b",
        borderRadius: "6px",
        overflow: "auto",
        background: "#020617",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          {/* 👉 ヘッダ固定（スクロールしても残る） */}
          <tr style={{ background: "#111827", position: "sticky", top: 0, zIndex: 1 }}>
            <th style={thStyle}>削除</th>
            <th style={thStyle}>日付</th>
            <th style={thStyle}>時間</th>
            <th style={thStyle}>ペア</th>
            <th style={thStyle}>TF</th>
            <th style={thStyle}>TF_type</th>
            <th style={thStyle}>DIR</th>
            <th style={thStyle}>PHASE</th>
            <th style={thStyle}>NOTE</th>
            <th style={thStyle}>ACTION</th>
            <th style={thStyle}>MODE</th>
            <th style={thStyle}>IMG</th>
            <th style={thStyle}>画像変更</th>
            <th style={thStyle}>更新</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((s, idx) => {
            const f = forms[s.id]; // 👉 編集用データ
            if (!f) return null;

            const isSelected = idx === selectedIndex; // 👉 行選択状態

            return (
              <tr
                key={s.id}
                onClick={() => setSelectedIndex(idx)} // 👉 行クリックで選択
                style={{
                  background: isSelected ? "#4a4f63" : "transparent",
                  color: isSelected ? "white" : "inherit",
                  cursor: "pointer",
                }}
              >
                {/* 削除 */}
                <td style={tdStyle}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 👉 行クリック防止
                      handleDelete(s);
                    }}
                    style={btnDelete}
                  >
                    削除
                  </button>
                </td>

                {/* 日付 */}
                <td style={tdStyle}>
                  <input
                    type="date"
                    value={f.date || ""}
                    onChange={(e) => updateField(s.id, "date", e.target.value)}
                    style={inputDate}
                  />
                </td>

                {/* 時間 */}
                <td style={tdStyle}>
                  <input
                    type="time"
                    value={f.time || formatTime(s.event_time)} // 👉 未入力時は既存値表示
                    onChange={(e) => updateField(s.id, "time", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={inputTime}
                  />
                </td>

                {/* ペア */}
                <td style={tdStyle}>
                  <select
                    value={f.pair}
                    onChange={(e) => updateField(s.id, "pair", e.target.value)}
                    style={selectSmall}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {PAIRS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>

                {/* TF */}
                <td style={tdStyle}>
                  <select
                    value={f.timeframe}
                    onChange={(e) =>
                      updateField(s.id, "timeframe", e.target.value)
                    }
                    style={selectSmall}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TIMEFRAMES.map((tf) => (
                      <option key={tf} value={tf}>
                        {tf}
                      </option>
                    ))}
                  </select>
                </td>

                {/* TF_type */}
                <td style={tdStyle}>
                  <select
                    value={f.timeframe_type}
                    onChange={(e) =>
                      updateField(s.id, "timeframe_type", e.target.value)
                    }
                    style={selectSmall}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TIMEFRAME_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>

                {/* DIR */}
                <td style={tdStyle}>
                  <select
                    value={f.direction}
                    onChange={(e) =>
                      updateField(s.id, "direction", e.target.value)
                    }
                    style={selectSmall}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {DIRECTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </td>

                {/* PHASE */}
                <td style={tdStyle}>
                  <select
                    value={f.phase}
                    onChange={(e) =>
                      updateField(s.id, "phase", e.target.value)
                    }
                    style={selectSmall}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>

                {/* NOTE */}
                <td style={{ ...tdStyle, minWidth: "180px" }}>
                  <textarea
                    value={f.notes}
                    onChange={(e) =>
                      updateField(s.id, "notes", e.target.value)
                    }
                    style={textareaStyle}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* ACTION */}
                <td style={tdStyle}>{s.action || "-"}</td>

                {/* MODE */}
                <td style={tdStyle}>{s.mode || "-"}</td>

                {/* IMG */}
                <td style={tdStyle}>{s.image_url ? "🖼️" : "－"}</td>

                {/* 画像変更 */}
                <td style={tdStyle}>
                  <label style={btnBlue} onClick={(e) => e.stopPropagation()}>
                    画像変更
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => handleReplaceImage(e, s)}
                    />
                  </label>
                </td>

                {/* 更新 */}
                <td style={tdStyle}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(s); // 👉 ここでログ更新（確定）
                    }}
                    style={btnGreen}
                  >
                    更新
                  </button>
                </td>
              </tr>
            );
          })}

          {/* 👉 データなし時 */}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={14} style={{ textAlign: "center", padding: "10px" }}>
                データがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================= STYLE ================= */

// 👉 小型select
const selectSmall: CSSProperties = {
  width: "90px",
  background: "#1e293b",
  color: "white",
  borderRadius: "4px",
};

// 👉 日付input
const inputDate: CSSProperties = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "4px",
};

// 👉 時刻input
const inputTime: CSSProperties = {
  width: "80px",
  background: "#1e293b",
  color: "white",
  borderRadius: "4px",
};

// 👉 メモ
const textareaStyle: CSSProperties = {
  width: "140px",
  height: "28px",
  background: "#1e293b",
  color: "white",
  borderRadius: "4px",
  resize: "none",
};

// 👉 削除ボタン（危険操作）
const btnDelete: CSSProperties = {
  padding: "4px 6px",
  fontSize: "11px",
  borderRadius: "4px",
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
};

// 👉 画像変更ボタン
const btnBlue: CSSProperties = {
  padding: "4px 6px",
  background: "#3b82f6",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "11px",
};

// 👉 更新ボタン（確定処理）
const btnGreen: CSSProperties = {
  padding: "4px 8px",
  fontSize: "11px",
  borderRadius: "4px",
  border: "none",
  background: "#10b981",
  color: "white",
  cursor: "pointer",
};