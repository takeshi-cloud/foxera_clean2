"use client";

import { useEffect, useState } from "react";

export const Clock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, tz: string) => {
    return date.toLocaleTimeString("ja-JP", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 20,
        fontSize: 11,
        opacity: 0.6,
        color: "#94a3b8",
        lineHeight: "16px",
        pointerEvents: "none",
        fontFamily: "monospace",
      }}
    >
      <div>TK&nbsp;&nbsp;{formatTime(now, "Asia/Tokyo")}</div>
      <div>UTC {formatTime(now, "UTC")}</div>
    </div>
  );
};