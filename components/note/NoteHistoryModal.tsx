"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/infra/supabase";

export const NoteHistoryModal = ({
  open,
  onClose,
  item,
}: any) => {
  const [logs, setLogs] = useState<any[]>([]);

  // =============================
  // 📦 データ取得
  // =============================
  useEffect(() => {
    if (!open || !item) return;

    const load = async () => {
      const { data } = await supabase
        .from("event_logs")
        .select("note, event_time")
        .eq("pair", item.pair)
        .eq("timeframe_type", item.timeframe_type)
        .eq("user_id", item.user_id)
        .neq("note", "")
        .order("event_time", { ascending: false })
        .limit(10);

      setLogs(data ?? []);
    };

    load();
  }, [open, item]);

  // =============================
  // ⌨️ ESCで閉じる
  // =============================
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "70%",
          left: "8%",
          transform: "translate(-50%, -50%)",
          background: "#060217",
          padding: 16,
          borderRadius: 8,
          width: 300,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {/* タイトル＋閉じる */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          <div>📝 メモ履歴</div>

          <div
            onClick={onClose}
            style={{
              cursor: "pointer",
              fontSize: "16px",
              padding: "2px 6px",
            }}
          >
            ×
          </div>
        </div>

        {/* ログ */}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {log.event_time?.slice(0, 10)}
            </div>
            <div>{log.note}</div>
          </div>
        ))}

        {logs.length === 0 && (
          <div style={{ opacity: 0.5 }}>メモなし</div>
        )}
      </div>
    </div>
  );
};