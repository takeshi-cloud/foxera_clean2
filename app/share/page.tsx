"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/infra/supabase";

const PAIRS = [
  "XAUUSD","USDJPY","GBPJPY","EURJPY",
  "GBPUSD","EURUSD","USDCHF","USDCAD",
  "GBPAUD","EURAUD","AUDJPY","AUDUSD",
  "EURGBP"
];

// ===============================
// 中身（UIそのまま）
// ===============================
function SharePageInner() {
  const params = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);

  const [selected, setSelected] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // 🔥 share画像復元（ここが重要）
  // ===============================
  useEffect(() => {
    const img = params.get("img");
    if (!img) return;

    setPreviewUrl(img);

    (async () => {
      try {
        const res = await fetch(img);
        const blob = await res.blob();
        const f = new File([blob], "share.png", { type: blob.type });
        setFile(f);
      } catch (e) {
        console.error("❌ file復元失敗", e);
      }
    })();
  }, [params]);

  // ===============================
  // 📋 ペースト（PC）
  // ===============================
  const handlePasteFile = (file: File) => {
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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

  // ===============================
  // 💾 保存（Storage + DB）
  // ===============================
  const handleSave = async () => {
    if (!selected || !file) return;

    try {
      setLoading(true);

      const fileName = `${selected}_${Date.now()}.png`;

      // 🔥 Storage保存
      const { error } = await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("screenshots")
        .getPublicUrl(fileName);

      // 🔥 DB保存
      await supabase.from("screenshots").insert({
        symbol: selected,
        path: fileName,
        date,
      });

      window.location.href = "/";
    } catch (e) {
      console.error("❌ 保存エラー", e);
    } finally {
      setLoading(false);
    }
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
          type="button"
            onClick={handleSave}
            disabled={!selected || !file}
            style={{
              padding: "8px 12px",
              background: selected && file ? "#ff00cc" : "#444",
              border: "none",
              color: "white",
              cursor: selected && file ? "pointer" : "not-allowed",
            }}
          >
            保存
          </button>

          <button
          type="button"
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

        {/* ペースト */}
        <div
          style={{
            marginTop: 10,
            padding: "14px",
            border: "1px dashed #555",
            borderRadius: 6,
            textAlign: "center",
            color: "#888",
            fontSize: 13,
          }}
        >
          📋 Ctrl+V / 長押しペースト
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
              <div
                onClick={() => {
                  setPreviewUrl(null);
                  setFile(null);
                }}
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
              プレビュー（Ctrl+V / Share）
            </span>
          )}
        </div>

        {loading && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            保存中...
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================
// Suspenseラッパー（←これだけ追加）
// ===============================
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SharePageInner />
    </Suspense>
  );
}