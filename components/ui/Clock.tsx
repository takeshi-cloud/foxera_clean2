"use client";

import { useEffect, useState } from "react";

export const Clock = () => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ja-JP"));
    };

    update();

    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null; // 初期はSSRと一致させる

  return (
  <div
    style={{
      color: "#fff",
      background: "rgba(0,0,0,0.6)",
      padding: "6px 10px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: "bold",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    }}
  >
    {time}
  </div>
);
};