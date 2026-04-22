"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/infra/supabase";

export const ScreenshotUploadModal = ({ open, onClose, symbol }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // =====================================
  // 📦 アップロード処理
  // =====================================
  const handleFile = async (file: File) => {
    try {
      setLoading(true);

      const fileName = `${symbol}_${Date.now()}.png`;

      const { error } = await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

      if (error) throw error;

      // DB保存
      await supabase.from("screenshots").insert({
        symbol,
        path: fileName,
        date: new Date().toISOString().slice(0, 10),
      });

      onClose();
    } catch (e) {
      console.error("❌ upload error", e);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // 📁 ファイル選択
  // =====================================
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // =====================================
  // 📥 ドロップ
  // =====================================
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // =====================================
  // 📋 Ctrl + V
  // =====================================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!open) return;

      const item = e.clipboardData?.items?.[0];
      if (!item) return;

      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [open]);

  // =====================================
  // ⌨ ESCで閉じる
  // =====================================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleKey);
    }

    return () => window.removeEventListener("keydown", handleKey);
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
          width: "500px",
          height:"200px",
          background: "#3f4046",
          borderRadius: "8px",
          padding: "16px",
          color: "white",
          position: "relative",
        }}
      >
        {/* ×ボタン */}
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ✕
        </div>

        {/* タイトル */}
        <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
          Upload Screenshot
        </div>

        {/* ファイル入力 */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
        />

        <div style={{ marginTop: "12px", fontSize: "12px", opacity: 0.7 }}>
          ドロップ / Ctrl+V でもOK
        </div>

        {loading && <div style={{ marginTop: "8px" }}>Uploading...</div>}
      </div>
    </div>
  );
};