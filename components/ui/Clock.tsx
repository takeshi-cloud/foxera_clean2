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

  return <div>{time}</div>;
};