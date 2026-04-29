"use client";

import { useEffect, useState } from "react";

const PAIRS = [
  "XAUUSD","USDJPY","GBPJPY","EURJPY",
  "GBPUSD","EURUSD","USDCHF","USDCAD",
  "GBPAUD","EURAUD","AUDJPY","AUDUSD",
  "EURGBP"
];

export default function SharePage() {
  const today = new Date().toISOString().slice(0, 10);

  const [selected, setSelected] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ===============================
  // 📋 ペースト（PC / iPad）
  // ===============================
  const handlePasteFile = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image")) {
          const file = item.getAsFile();
          if (file) {
            handlePasteFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSave = async () => {
    if (!selected || !previewUrl) return;

    console.log("保存", { selected, date });

    // TODO: Supabase保存

    window.location.href = "/";
  };

  const handleCancel = () => {
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 16,
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 上段 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              flex: 1,
              padding: 8,
              background: "#222",
              color: "white",
              border: "1px solid #555",
            }}
          />

          <button
            onClick={handleSave}
            disabled={!selected || !previewUrl}
            style={{
              padding: "8px 12px",
              background: selected && previewUrl ? "#ff00cc" : "#444",
              border: "none",
              color: "white",
              cursor: selected && previewUrl ? "pointer" : "not-allowed",
            }}
          >
            保存
          </button>

          <button
            onClick={handleCancel}
            style={{
              padding: "8px 12px",
              background: "#333",
              border: "none",
              color: "white",
            }}
          >
            中止
          </button>
        </div>

        {/* 通貨ペア */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {PAIRS.map((p) => {
            const active = selected === p;

            return (
              <div
                key={p}
                onClick={() => setSelected(p)}
                style={{
                  padding: "10px 6px",
                  textAlign: "center",
                  cursor: "pointer",
                  border: active ? "1px solid #ff00cc" : "1px solid #555",
                  background: active ? "#ff00cc" : "#222",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {active && "✔ "}
                {p}
              </div>
            );
          })}
        </div>

        {/* ================= 長押しペーストエリア ================= */}
        <div
  contentEditable
  suppressContentEditableWarning
  onPaste={(e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (file) {
          handlePasteFile(file);
          return;
        }
      }
    }
  }}
  style={{
    marginTop: 10,
    padding: "14px",
    border: "1px dashed #555",
    borderRadius: 6,
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    userSelect: "text",
  }}
>
  📋 ここを長押し → ペースト
</div>

        {/* プレビュー */}
        <div
          style={{
            flex: 1,
            border: "1px solid #333",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {previewUrl ? (
            <>
              {/* ×解除 */}
              <div
                onClick={() => setPreviewUrl(null)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.6)",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </div>

              <img
                src={previewUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </>
          ) : (
            <span style={{ opacity: 0.4 }}>
              プレビュー（Ctrl+V / 長押し）
            </span>
          )}
        </div>
      </div>
    </div>
  );
}