"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import { ScreenshotViewerModal } from "@/components/screenshot/ScreenshotViewerModal";
import ImageViewer from "@/components/screenshot/ImageViewer";
import { MARKETS } from "@/lib/constants/markets"; 

export const ScreenshotPanel = ({
  activePair,
  setActivePair,   // ←追加
}: {
  activePair: string;
  setActivePair: (pair: string) => void;
}) => {
  const [shot, setShot] = useState<any>(null);
  const [note, setNote] = useState("");
  const [openViewer, setOpenViewer] = useState(false); // ← 変更
  const [openPairSelect, setOpenPairSelect] = useState(false);

  const marketMap = Object.fromEntries(
  MARKETS.map((m) => [m.key, m])
);

  useEffect(() => {
    if (!activePair) return;

    const load = async () => {
      const { data } = await supabase
        .from("screenshots")
        .select("*")
        .eq("symbol", activePair)
        .order("created_at", { ascending: false })
        .limit(1);

      const s = data?.[0] ?? null;
      setShot(s);
      setNote(s?.notes ?? "");
    };

    load();
  }, [activePair]);

  const getUrl = (path: string) =>
    supabase.storage.from("screenshots").getPublicUrl(path).data.publicUrl;

  // 🔥 note保存
  const handleSaveNote = async () => {
    if (!shot) return;

    await supabase
      .from("screenshots")
      .update({ notes: note })
      .eq("id", shot.id);
  };

  
return (
  <>
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 8,
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "0px",
      }}
    >
      {/* 画像 */}
      {shot ? (
        <ImageViewer src={getUrl(shot.path)} />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            color: "#666",
            objectFit: "contain",
          }}
        >
          No Screenshot
        </div>
      )}

      {/* 🔥 ペア選択ドロップダウン（←ここが追加の本体） */}
      {openPairSelect && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 10,
            background: "#020617",
            border: "1px solid #334155",
            borderRadius: 6,
            padding: 8,
            zIndex: 1000,
          }}
        >
          {MARKETS.map((m) => (
            <div
              key={m.key}
              onClick={() => {
                setActivePair(m.key);
                setOpenPairSelect(false);
              }}
              style={{
                padding: "4px 8px",
                cursor: "pointer",
                color: m.key === activePair ? "#ff00cc" : "#fff",
              }}
            >
              {m.label}
            </div>
          ))}
        </div>
      )}

      {/* ヘッダー */}
      {shot && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "8px 12px",
            fontSize: 15,
            color: "#fff",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* 左 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
            }}
          >
            {/* タイトル */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                whiteSpace: "nowrap",
                padding: "4px 10px",
                borderRadius: 6,
                border: "3px solid #ff00cc",
                background: "rgba(255,0,204,0.08)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {/* SYMBOL */}
              <span
                onClick={() => setOpenPairSelect(true)}
                style={{
                  color: "#ff00cc",
                  cursor: "pointer",
                }}
              >
                {marketMap[activePair]?.label || activePair}
              </span>

              {/* 他 */}
              <span style={{ color: "#fff" }}>
                {shot.date}　{shot.type}
              </span>
            </div>

            {/* メモ */}
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="メモ欄"
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.5)",
                border: "1px solid #333",
                color: "#fff",
                fontSize: 11,
                padding: 4,
              }}
            />
          </div>

          {/* ボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenViewer(true);
            }}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#fff",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            📂
          </button>
        </div>
      )}
    </div>

    {/* モーダル */}
    <ScreenshotViewerModal
      open={openViewer}
      onClose={() => setOpenViewer(false)}
      symbol={activePair}
    />
  </>
);
};