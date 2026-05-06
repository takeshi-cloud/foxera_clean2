"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/infra/supabase";

const PAIRS = [
  "XAUUSD","USDJPY","GBPJPY","EURJPY",
  "GBPUSD","EURUSD","USDCHF","USDCAD",
  "GBPAUD","EURAUD","AUDJPY","AUDUSD",
  "EURGBP"
];

export const QuickUploadModal = ({ open, onClose }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [selected, setSelected] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // 📦 ファイル処理
  // ===============================
  const handleFile = (f: File) => {
    setFile(f);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  

  // ===============================
  // 💾 保存
  // ===============================
  const handleSave = async () => {
    if (!selected || !file) return;

    try {
      setLoading(true);

      const fileName = `${selected}_${Date.now()}.png`;

      await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

      await supabase.from("screenshots").insert({
        symbol: selected,
        path: fileName,
        date,
      });

      onClose();
    } catch (e) {
      console.error("❌ upload error", e);
    } finally {
      setLoading(false);
    }
  };

// ===============================
// 🎯 iPad用：モーダルが開いたら textarea にフォーカス
// ===============================
useEffect(() => {
  if (open) {
    const el = document.getElementById("paste-catcher") as HTMLTextAreaElement;
    el?.focus();
  }
}, [open]);

// ===============================
// 📋 iPad対応：textarea の paste を拾う
// ===============================
useEffect(() => {
  const el = document.getElementById("paste-catcher") as HTMLTextAreaElement;
  if (!el) return;

  const handlePaste = (e: ClipboardEvent) => {
    if (!open) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image")) {
        const f = item.getAsFile();
        if (f) {
          handleFile(f);
          return;
        }
      }
    }
  };

  el.addEventListener("paste", handlePaste);
  return () => el.removeEventListener("paste", handlePaste);
}, [open]);






  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#111",
          borderRadius: 10,
          padding: 16,
          color: "white",
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
            disabled={!selected || !file}
            style={{
              padding: "8px 12px",
              background: selected && file ? "#0ea5e9" : "#444",
              border: "none",
              color: "white",
            }}
          >
            保存
          </button>

          <button
            onClick={onClose}
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

        {/* 通貨 */}
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
                  border: active ? "1px solid #0ea5e9" : "1px solid #555",
                  background: active ? "#0ea5e9" : "#222",
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

  {/* 🔥 ファイル選択 */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
        />
{/* 🔥 iPad用：隠しペーストエリア */}
<textarea
  id="paste-catcher"
  style={{
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
    height: 0,
    width: 0,
  }}
/>


{/* ================= 長押しペースト ================= */}
<div
  style={{
    marginTop: 10,
    padding: "14px",
    border: "1px dashed #555",
    borderRadius: 6,
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    WebkitUserSelect: "none",
  }}
>
  📋 長押し → ペースト
</div>

<div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
  ドロップ / Ctrl+V / 長押しペースト OK
</div>

{/* 状態 */}
{file && (
  <div style={{ marginTop: 8, fontSize: 12 }}>
    ✔ 画像セット済み
  </div>
)}

{loading && (
  <div style={{ marginTop: 8, fontSize: 12 }}>
    Uploading...
  </div>
)}

      </div>
    </div>
  );
};