"use client";

import { useState, useEffect } from "react";

export default function ImageViewer({ src }: { src: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const [fitScale, setFitScale] = useState(1);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // =============================
  // 🔥 マウス離したら必ず解除
  // =============================
  useEffect(() => {
    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  // =============================
  // 🔍 ズーム
  // =============================
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    setScale((prev) => {
      const next = prev + delta;

      // 🔥 最小はfitScale（これで消えない）
      return Math.min(Math.max(next, fitScale), 5);
    });
  };

  // =============================
  // ✋ ドラッグ
  // =============================
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= fitScale * 1.01) return;

    setIsDragging(true);
    setStart({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const nextX = e.clientX - start.x;
    const nextY = e.clientY - start.y;

    setPos(clamp(nextX, nextY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // =============================
  // 🔥 位置制限
  // =============================
  const clamp = (x: number, y: number) => {
    const container = document.getElementById("viewer-root");
    if (!container) return { x, y };

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const imgW = imgSize.w * scale;
    const imgH = imgSize.h * scale;

    const centerX = (cw - imgW) / 2;
    const centerY = (ch - imgH) / 2;

    if (imgW > cw || imgH > ch) {
      return {
        x: Math.min(centerX + (imgW - cw) / 2, Math.max(centerX - (imgW - cw) / 2, x)),
        y: Math.min(centerY + (imgH - ch) / 2, Math.max(centerY - (imgH - ch) / 2, y)),
      };
    }

    return { x: centerX, y: centerY };
  };

  // =============================
  // 🔥 リセットボタン
  // =============================
  const resetView = () => {
    const container = document.getElementById("viewer-root");
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const fit = fitScale;

    setScale(fit);

    setPos({
      x: (cw - imgSize.w * fit) / 2,
      y: (ch - imgSize.h * fit) / 2,
    });
  };

  // =============================
  // 🎨 UI
  // =============================
  return (
    <div
      id="viewer-root"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: "#000",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* 🔥 リセットボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          resetView();
        }}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid #555",
          color: "#fff",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        ⤾
      </button>

<img
  src={src}
  onLoad={(e) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    setImgSize({
      w: naturalW,
      h: naturalH,
    });

    // 🔥 cover（余白ゼロ）
    const fit = Math.max(
      cw / naturalW,
      ch / naturalH
    );

    const imgW = naturalW * fit;
    const imgH = naturalH * fit;

    setFitScale(fit);
    setScale(fit);

    // 🔥 完全中央（cover対応）

    const offsetY = 30; // ←好きなだけ（10〜30くらい）
    setPos({
      x: (cw - imgW) / 2,
      y: (ch - imgH) / 2 + offsetY,
    });
  }}
  style={{
    position: "absolute",
    top: 0,
    left: 0,

    transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
    transformOrigin: "top left",

    pointerEvents: "none",
    userSelect: "none",

    // 🔥 重要（これで制約外す）
    maxWidth: "none",
    maxHeight: "none",
  }}
/>
    </div>
  );
}