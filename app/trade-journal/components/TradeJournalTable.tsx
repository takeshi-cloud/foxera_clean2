"use client";

import {
  DisplayJournal,
} from "@/lib/trade/journal/builder/journalTableBuilder";

type Props = {
  journals: DisplayJournal[];
  onDelete: (id: string) => void;
  onOpenJournal: (id: string) => void;
  onToggleAnalyzed: (
    id: string,
    value: boolean
  ) => void;
};

export default function TradeJournalTable({
  journals,
  onDelete,
  onOpenJournal,
  onToggleAnalyzed,
}: Props) {
  const resultColor = (
    result: string
  ) => {
    if (result === "WIN")
      return "#3b82f6";

    if (result === "LOSS")
      return "#ef4444";

    return "#ffffff";
  };

  return (
   <div
  style={{
    overflowX: "auto",
  }}
>
  <table
    style={{
      borderCollapse: "collapse",
      width: "auto",
      tableLayout: "auto",
    }}
  >
      <thead>
        <tr>
          <th style={thStyle}>
            分析
          </th>

          <th style={thStyle}>
            Entry
          </th>

          <th style={thStyle}>
            Exit
          </th>

          <th style={thStyle}>
            Hold
          </th>

          <th style={thStyle}>
            ペア
          </th>

          <th style={thStyle}>
            方向
          </th>

          <th style={thStyle}>
            結果
          </th>

          <th style={thStyle}>
            Size
          </th>

          <th style={thStyle}>
            Pips
          </th>

          <th style={thStyle}>
            Profit（円）
          </th>

          <th style={thStyle}>
            詳細トレード日誌
          </th>
        </tr>
      </thead>

      <tbody>
        {journals.map((j) => (
          <tr key={j.id}>
            {/* analyzed */}
            <td style={tdStyle}>
              <input
                type="checkbox"
                checked={
                  j.analyzed ??
                  true
                }
                onChange={(
                  e
                ) =>
                  onToggleAnalyzed(
                    j.id,
                    e.target
                      .checked
                  )
                }
              />
            </td>

            {/* entry */}
            <td style={tdStyle}>
              {j.entryLabel}
            </td>

            {/* exit */}
            <td style={tdStyle}>
              {j.exitLabel}
            </td>

            {/* hold */}
            <td style={tdStyle}>
              {j.holdLabel}
            </td>

            {/* symbol */}
            <td style={tdStyle}>
              {j.symbol}
            </td>

            {/* direction */}
            <td style={tdStyle}>
              {j.direction}
            </td>

            {/* result */}
            <td
              style={{
                ...tdStyle,
                color:
                  resultColor(
                    j.result
                  ),
                fontWeight: 700,
              }}
            >
              {j.result}
            </td>

            {/* size */}
            <td style={tdStyle}>
              {j.size ?? "-"}
            </td>

            {/* pips */}
            <td
              style={{
                ...tdStyle,
                color:
                  resultColor(
                    j.result
                  ),
              }}
            >
              {j.profit_pips}
            </td>

            {/* profit */}
            <td
              style={{
                ...tdStyle,
                color:
                  resultColor(
                    j.result
                  ),
                textAlign:
                  "right",
              }}
            >
              {j.profitLabel}
            </td>

            {/* journal action */}
            <td style={tdStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    width: 20,
                    textAlign:
                      "center",
                    fontSize: 20,
                  }}
                >
                  {j.chart_state ===
                  "saved"
                    ? "📈"
                    : ""}
                </span>

                <button
                  onClick={() =>
                    onOpenJournal(
                      j.id
                    )
                  }
                  style={
                    detailButtonStyle
                  }
                >
                  詳細
                </button>

                <button
                  onClick={() =>
                    onDelete(
                      j.id
                    )
                  }
                  style={
                    deleteButtonStyle
                  }
                >
                  削除
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

const thStyle = {
  borderBottom:
    "1px solid #555",
  padding: "5px 25px",
  textAlign:
    "left" as const,
  whiteSpace:
    "nowrap" as const,
};

const tdStyle = {
  padding: "5px 25px",
   whiteSpace: "nowrap" as const,
  borderBottom: "1px solid #444",
};

const detailButtonStyle = {
  background: "#2563eb",
  padding: "3px 10px",
  borderRadius: 6,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  color: "white",
};

const deleteButtonStyle = {
  background: "#dc2626",
  padding: "3px 10px",
  borderRadius: 6,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  color: "white",
};