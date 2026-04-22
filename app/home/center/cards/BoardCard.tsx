"use client";

import { useState } from "react";
import { ScreenshotUploadModal } from "@/components/screenshot/ScreenshotUploadModal";
import { ScreenshotViewerModal } from "@/components/screenshot/ScreenshotViewerModal";

export const BoardCard = ({
  item,
  screenshots,
  provided,
  type,

  // 👇 受け取る
  activePair,
  setActivePair,
  active,
  onClick,
  onToggleDirection,
  onRemove,
  onMoveToWait,
  onCreateShort,
  onUpdateTF,
}: any) => {

 const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "----.--.--";
  return dateStr.slice(0, 10).replace(/-/g, ".");
};
  const [showTfMenu, setShowTfMenu] = useState(false);
  console.log("ITEM:", item);

  // =========================================
  // 🔥 ACTIVE（Rowと同じロジック）
  // =========================================
  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();

  const isActive = active;

  // =========================================
  // 🎨 direction UI
  // =========================================
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

  // =========================================
  // 🎯 共通スタイル（Rowと同一）
  // =========================================
  const baseStyle: any = {
    width: "100%",
    padding: "4px 8px",
    marginTop: "4px",
    borderRadius: "6px",
    background: "#020617",

    border: isActive
      ? "2px solid #ff4d6d"
      : `2px solid ${borderColor}`,

    boxShadow: isActive
  ? "0 0 0 3px #ff00cc, 0 0 20px #ff00cc, 0 0 40px #ff4d6d"
  : "none",

    transform: isActive ? "scale(1.02)" : "scale(1)",
    zIndex: isActive ? 10 : 1,

    cursor: "pointer",
    transition: "all 0.15s ease",
  };


  const [openUpload, setOpenUpload] = useState(false);
const [openViewer, setOpenViewer] = useState(false);

// =========================================
// 🔴 SHORT
// =========================================
if (type === "short") {
  return (
    <>
      <div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        onClick={onClick}
        style={{
          ...baseStyle,
          ...(provided?.draggableProps?.style ?? {}),
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          <b>{item.pair}</b>

          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleDirection(item);
              }}
              style={{
                width: "20px",
                textAlign: "center",
                background: bgColor,
                color: "white",
                cursor: "pointer",
              }}
            >
              {label}
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              style={{ cursor: "pointer" }}
            >
              ×
            </div>
          </div>
        </div>

        <div style={{ marginTop: "4px", fontSize: "11px", position: "relative" }}>
          {formatDate(item.event_time)}

          <span
            style={{ marginLeft: "6px", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setShowTfMenu(!showTfMenu);
            }}
          >
            {item.tf ?? "NONE"} ▼
          </span>
        </div>

        {/* ボタン */}
        <div style={{ marginTop: "6px", display: "flex", gap: "5px" ,alignItems: "center",
    whiteSpace: "nowrap", }}>
          <button onClick={(e) => { e.stopPropagation(); onMoveToWait(item); }}>←</button>
          <button onClick={(e) => { e.stopPropagation(); onCreateShort(item); }}>短期</button>
          <button onClick={(e) => { e.stopPropagation(); setOpenUpload(true); }}>📷</button>
          <button onClick={(e) => { e.stopPropagation(); setOpenViewer(true); }}>🔗</button>
        </div>
      </div>

      {/* モーダル */}
      <ScreenshotUploadModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        symbol={item.pair}
      />

      <ScreenshotViewerModal
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        symbol={item.pair}
      />
    </>
  );
}

// =========================================
// 🟢 LONG
// =========================================
return (
  <>
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...(provided?.draggableProps?.style ?? {}),
      }}
    >
      <div style={{ display: "flex" }}>
        <b>{item.pair}</b>


        <div
  onClick={(e) => {
    e.stopPropagation();
    onToggleDirection(item);
  }}
  style={{
    marginLeft: "auto",
    width: "20px",
    textAlign: "center",
    background: bgColor,
    color: "white",
    cursor: "pointer",
  }}
>
  {label}
</div>
      </div>

      <div style={{ marginTop: "4px", fontSize: "11px" }}>
        {formatDate(item.event_time)}
      </div>

      {/* ボタン */}
      <div style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
        <button onClick={(e) => { e.stopPropagation(); onMoveToWait(item); }}>←</button>
        <button onClick={(e) => { e.stopPropagation(); onCreateShort(item); }}>短期</button>
        <button onClick={(e) => { e.stopPropagation(); setOpenUpload(true); }}>📷</button>
        <button onClick={(e) => { e.stopPropagation(); setOpenViewer(true); }}>🔗</button>
      </div>
    </div>

    {/* モーダル */}
    <ScreenshotUploadModal
      open={openUpload}
      onClose={() => setOpenUpload(false)}
      symbol={item.pair}
    />

    <ScreenshotViewerModal
      open={openViewer}
      onClose={() => setOpenViewer(false)}
      symbol={item.pair}
    />
  </>
);
};