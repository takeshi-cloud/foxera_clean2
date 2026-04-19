"use client";

import { useUploadState } from "./useUploadState";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import ImageViewer from "@/app/upload/ImageViewer";

import {
  PAIRS,
  TIMEFRAMES,
  DIRECTIONS,
  PHASES,
} from "../../lib/constants/LogOptions";

import { CSSProperties } from "react";

export default function UploadUI() {
  const router = useRouter();

  const {
    file,
    preview,
    handleFileChange,
    handleRemoveImage,
    handleDrop,
    handleDragOver,

    pair,
    setPair,
    isCustomPair,
    setIsCustomPair,
    timeframe,
    setTimeframe,
    direction,
    setDirection,
    phase,
    setPhase,
    date,
    setDate,
    note,
    setNote,
  } = useUploadState();

  const [message, setMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [time, setTime] = useState("00:00");
  const [force, setForce] = useState(false);
  const [dragging, setDragging] = useState(false);

  // =========================
  // 🔥 保存処理
  // =========================
  const onSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("ログインが必要です");
      return;
    }

    if (!file) {
      setMessage("画像がありません");
      return;
    }

    if (force) {
      const ok = confirm(
        "この操作は現在状態を強制上書きします。\nこの日時より新しいログは削除されます。"
      );
      if (!ok) return;
    }

    let eventTime;

    const today = new Date().toDateString();
    const inputDate = new Date(date).toDateString();

    if (today === inputDate) {
      eventTime = new Date().toISOString();
    } else {
      if (showDetail && time) {
        eventTime = new Date(`${date}T${time}`).toISOString();
      } else {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        eventTime = d.toISOString();
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("pair", pair);

    formData.append(
      "timeframeType",
      timeframe === "5M" || timeframe === "15M" ? "LTF" : "HTF"
    );

    formData.append("direction", direction);
    formData.append("phase", phase);
    formData.append("date", eventTime);
    formData.append("note", note);
    formData.append("force_update", String(force));

    // 🔥 ここだけ修正（安全なレスポンス処理）
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    let res;
    try {
      res = JSON.parse(text);
    } catch {
      console.error("APIエラー（JSONじゃない）:", text);
      setMessage("サーバーエラー");
      return;
    }

    setMessage(res.message);
  };

  return (
    <div style={container}>
      {/* ================= 左UI ================= */}
      <div style={left}>
        <button onClick={() => router.push("/home")} style={homeBtn}>
          ← HOME
        </button>

        <div
          style={{
            ...uploadBox,
            border: dragging
              ? "2px dashed #3b82f6"
              : "2px dashed transparent",
          }}
          onClick={() =>
            document.getElementById("fileInput")?.click()
          }
          onDragOver={(e) => {
            handleDragOver(e);
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            handleDrop(e);
            setDragging(false);
          }}
        >
          {file ? file.name : "📂 or Ctrl+V or Drag & Drop"}

          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {isCustomPair ? (
          <input
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            onBlur={() => {
              if (!pair.trim()) {
                setIsCustomPair(false);
                setPair("USDJPY");
              }
            }}
            placeholder="ペア入力"
            style={selectStyle}
          />
        ) : (
          <select
            value={pair}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomPair(true);
                setPair("");
              } else {
                setPair(e.target.value);
              }
            }}
            style={selectStyle}
          >
            {PAIRS.map((p) => (
              <option key={p}>{p}</option>
            ))}
            <option value="__custom__">その他</option>
          </select>
        )}

        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={selectStyle}>
          {TIMEFRAMES.map((tf) => (
            <option key={tf}>{tf}</option>
          ))}
        </select>

        <select value={direction} onChange={(e) => setDirection(e.target.value)} style={selectStyle}>
          {DIRECTIONS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select value={phase} onChange={(e) => setPhase(e.target.value)} style={selectStyle}>
          {PHASES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={selectStyle} />

        <button onClick={() => setShowDetail(!showDetail)} style={toggleBtn}>
          時刻 {showDetail ? "▲" : "▼"}
        </button>

        {showDetail && (
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={selectStyle} />
        )}

        <label style={dangerLabel}>
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
          />
          これを最新状態として上書き
        </label>

        <textarea value={note} onChange={(e) => setNote(e.target.value)} style={textareaStyle} />

        <button onClick={onSave} style={saveBtn}>
          保存
        </button>

        <p style={messageStyle(message)}>{message}</p>
      </div>

      {/* ================= 右（プレビュー） ================= */}
      <div style={right}>
        {preview ? (
          <>
            <button onClick={handleRemoveImage} style={removeBtn}>
              🗑
            </button>

            <ImageViewer src={preview} />
          </>
        ) : (
          <div style={noImage}>No Image</div>
        )}
      </div>
    </div>
  );
}

// =======================
// style
// =======================

const container: CSSProperties = {
  display: "flex",
  height: "100vh",
  background: "#0f172a",
  color: "white",
};

const left: CSSProperties = {
  width: "240px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const right: CSSProperties = {
  flex: 1,
  position: "relative",
};

const homeBtn: CSSProperties = { padding: "6px" };

const uploadBox: CSSProperties = {
  padding: "12px",
  background: "#1e293b",
  textAlign: "center",
  cursor: "pointer",
};

const selectStyle: CSSProperties = { padding: "8px" };

const textareaStyle: CSSProperties = { height: "80px" };

const saveBtn: CSSProperties = {
  padding: "10px",
  background: "#3b82f6",
};

const removeBtn: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 20,
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.15s ease",
};

const noImage: CSSProperties = {
  textAlign: "center",
  marginTop: "40%",
};

const toggleBtn: CSSProperties = {
  fontSize: "12px",
  opacity: 0.7,
};

const dangerLabel: CSSProperties = {
  fontSize: "12px",
  color: "#f87171",
};

const messageStyle = (msg: string): CSSProperties => ({
  fontSize: "12px",
  color:
    msg.includes("失敗") || msg.includes("エラー")
      ? "#f87171"
      : "#34d399",
});