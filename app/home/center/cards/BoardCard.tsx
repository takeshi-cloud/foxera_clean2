"use client";

import { useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import { ScreenshotUploadModal } from "@/components/screenshot/ScreenshotUploadModal";
import { updateNoteCommand } from "@/lib/workflow/board/boardActions"
import { NoteHistoryModal } from "@/components/note/NoteHistoryModal";

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

  // =============================
  // State
  // =============================
  const [openUpload, setOpenUpload] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(item.note || "");
  const [openHistory, setOpenHistory] = useState(false);

  // =============================
  // Save
  // =============================
  const handleSaveNote = async () => {
  // 変更なければ何もしない
  if (noteValue === (item.note || "")) {
    setEditing(false);
    return;
  }

  console.log("🔥 SAVE NOTE", noteValue);

  await updateNoteCommand(item, noteValue);

  setEditing(false);
};

  // =============================
  // Styles
  // =============================
  const styles = {
    card: {
      width: "100%",
      padding: "2px 5px",
      marginTop: "2px", // ←修正
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
      alignItems: "center",
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
        {/* 上段 */}
        <div style={styles.rowTop}>
          <div style={styles.pair}>{item.pair}</div>

          <div style={styles.rightGroup}>
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

        {/* 中段 */}
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

{/* NOTE（編集＋履歴） */}
<div style={styles.noteRow}>
  {/* 📝（履歴） */}
  <span
    style={{ flexShrink: 0, cursor: "pointer" }}
    onClick={(e) => {
      e.stopPropagation();
      setOpenHistory(true);
    }}
  >
    📝
  </span>

  {/* 入力 */}
  <input
    value={noteValue}
    onChange={(e) => setNoteValue(e.target.value)}
    onBlur={handleSaveNote}
    onClick={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    style={{
      flex: 1,
      minWidth: 0,

      background: "transparent",
      border: "none",
      outline: "none",
      color: "white",

      fontSize: "14px",
      width: "100%",

      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    }}
    placeholder="メモ..."
  />
</div>

</div>

{/* 📸アップロード */}
<ScreenshotUploadModal
  open={openUpload}
  onClose={() => setOpenUpload(false)}
  symbol={item.pair}
/>

{/* 📝履歴モーダル */}
<NoteHistoryModal
  open={openHistory}
  onClose={() => setOpenHistory(false)}
  item={item}
/>
    </>
  );
};