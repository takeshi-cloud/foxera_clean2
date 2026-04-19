"use client";

import { useState } from "react";

export default function ImageViewer({ src }: { src: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  // 🔍 ホイールズーム
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setOrigin({ x: offsetX, y: offsetY });

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  // ✋ ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  // ✋ ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  // ✋ ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: "#000",
      }}
    >
      {/* 操作用レイヤー */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          cursor: isDragging ? "grabbing" : "grab",
          pointerEvents: "auto",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* 画像本体 */}
      <img
        src={src}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: `${origin.x}px ${origin.y}px`,
          maxWidth: "none",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}
