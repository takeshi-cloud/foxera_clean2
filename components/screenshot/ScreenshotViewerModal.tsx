"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import ImageViewer from "@/components/screenshot/ImageViewer";

export const ScreenshotViewerModal = ({ open, onClose, symbol }: any) => {
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [isFull, setIsFull] = useState(false);

  // =====================================
  // 📸 データ取得
  // =====================================
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const { data } = await supabase
        .from("screenshots")
        .select("*")
        .eq("symbol", symbol)
        .order("created_at", { ascending: false });

      setList(data ?? []);
      setSelected(data?.[0] ?? null);
    };

    load();
  }, [open, symbol]);

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

  const getUrl = (path: string) =>
  supabase.storage.from("images").getPublicUrl(path).data.publicUrl;

  // 日付整形
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("ja-JP");

  if (!open) return null;

  return (
    <div
      onClick={onClose} // ← 外クリックで閉じる
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: isFull ? "stretch" : "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // ← 内側クリック無効化
        style={{
          width: isFull ? "100vw" : "900px",
          height: isFull ? "100vh" : "600px",
          background:"#3f4046",
          borderRadius: isFull ? "0px" : "8px",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* 左：一覧 */}
        <div
          style={{
            width: "250px",
            borderRight: "1px solid #333",
            overflowY: "auto",
            color: "white",
          }}
        >
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background:
                  selected?.id === item.id ? "#1e293b" : "transparent",
              }}
            >
              {formatDate(item.created_at)}
            </div>
          ))}
        </div>

        {/* 右：プレビュー */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: "8px",
              borderBottom: "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <span>{symbol}</span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setIsFull((p) => !p)}>
                ⛶
              </button>

              <button onClick={onClose}>✕</button>
            </div>
          </div>

          {/* プレビュー */}
          <div
            style={{
              flex: 1,
              position: "relative",
            }}
            onDoubleClick={() => setIsFull((p) => !p)}
          >
            {selected && (
              <ImageViewer src={getUrl(selected.path)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};