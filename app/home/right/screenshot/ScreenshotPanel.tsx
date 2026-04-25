"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import { ScreenshotViewerModal } from "@/components/screenshot/ScreenshotViewerModal";
import ImageViewer from "@/components/screenshot/ImageViewer";

export const ScreenshotPanel = ({ activePair }: { activePair: string }) => {
  const [shot, setShot] = useState<any>(null);
  const [note, setNote] = useState("");
  const [openViewer, setOpenViewer] = useState(false); // ← 変更

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
    supabase.storage.from("images").getPublicUrl(path).data.publicUrl;

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
          background: "#000",
          position: "relative",
        }}
      >
        {/* 画像 */}
        {shot ? (
         <ImageViewer src={getUrl(shot.path)} />
        ) : (
          <div style={{ color: "#666" }}>No Screenshot</div>
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
  {/* SYMBOLだけピンク */}
  <span style={{ color: "#ff00cc" }}>
    {shot.symbol}
  </span>

  {/* 他は白 */}
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

            {/* 右ボタン */}
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

      {/* 🔥 Viewerモーダル */}
      <ScreenshotViewerModal
        open={openViewer}
        onClose={() => setOpenViewer(false)}
        symbol={activePair}
      />
    </>
  );
};