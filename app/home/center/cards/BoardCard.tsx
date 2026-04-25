"use client";

import { useState } from "react";
import { ScreenshotUploadModal } from "@/components/screenshot/ScreenshotUploadModal";

export const BoardCard = ({
  item,
  provided,
  type,
  active,
  onClick,
  onToggleDirection,
  onRemove,
}: any) => {

  // =============================
  // Utils
  // =============================
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "--.--";
    return dateStr.slice(5, 10).replace("-", ".");
  };

  const isActive = active;

  const borderColor =
    item.direction === "long"
      ? "#22c55e"
      : item.direction === "short"
      ? "#ef4444"
      : "#334155";

  const bgColor =
    item.direction === "long"
      ? "#22c55e"
      : item.direction === "short"
      ? "#ef4444"
      : "#475569";

  const label =
    item.direction === "long"
      ? "L"
      : item.direction === "short"
      ? "S"
      : "-";

  const [openUpload, setOpenUpload] = useState(false);

  // =============================
  // Styles（全部ここに集約）
  // =============================
  const styles = {
    card: {
      width: "100%",
      padding: "2px 5px",
      marginTop: "2x",
      borderRadius: "6px",
      background: "#020617",
      border: isActive
        ? "2px solid #ff4d6d"
        : `2px solid ${borderColor}`,
      boxShadow: isActive
        ? "0 0 0 3px #ff00cc, 0 0 20px #ff00cc"
        : "none",
      transform: isActive ? "scale(1.02)" : "scale(1)",
      zIndex: isActive ? 10 : 1,
      cursor: "pointer",
      transition: "all 0.15s ease",
    },

    rowTop: {
      display: "flex",
      alignItems: "center", // ←ズレ防止
    },

    pair: {
      fontSize: "15px",
      letterSpacing: "0.5px",
      fontWeight: 600,
    },

    rightGroup: {
      marginLeft: "auto",
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },

    directionBox: {
      width: "18px",
      height: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "17px",
      borderRadius: "4px",
      cursor: "pointer",
    },

    remove: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    },

    rowMid: {
      marginTop: "2px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
    },

    tf: {
      marginLeft: "6px",
    },

    upload: {
      marginLeft: "auto",
    },

    noteRow: {
      marginTop: "2px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "2px",
      width: "100%",
      overflow: "hidden",
    },

    noteText: {
      flex: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  };

  // =============================
  // UI
  // =============================
  return (
    <>
      <div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        onClick={onClick}
        style={{
          ...styles.card,
          ...(provided?.draggableProps?.style ?? {}),
        }}
      >
        {/* ========= 上段 ========= */}
        <div style={styles.rowTop}>
          <div style={styles.pair}>{item.pair}</div>

          <div style={styles.rightGroup}>
            {/* L/S */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleDirection(item);
              }}
              style={{
                ...styles.directionBox,
                background: bgColor,
              }}
            >
              {label}
            </div>

            {/* × */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              style={styles.remove}
            >
              ×
            </div>
          </div>
        </div>

        {/* ========= 中段 ========= */}
        <div style={styles.rowMid}>
          {formatDate(item.event_time)}

          <span style={styles.tf}>
            {item.tf ?? ""}
          </span>

          <div style={styles.upload}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenUpload(true);
              }}
            >
              📷
            </button>
          </div>
        </div>

        {/* ========= NOTE ========= */}
        <div style={styles.noteRow}>
          <span>📝</span>
          <span style={styles.noteText}>
            {item.note || ""}
          </span>
        </div>
      </div>

      {/* ========= Modal ========= */}
      <ScreenshotUploadModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        symbol={item.pair}
      />
    </>
  );
};