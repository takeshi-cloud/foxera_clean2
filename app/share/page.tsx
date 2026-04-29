"use client";

import { useEffect, useState } from "react";

export default function SharePage() {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      console.log("params", params);

      // Androidは formData で来るので後で対応
    };

    handle();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Share Received</h2>

      {file && <div>画像受信済み</div>}

      {!file && <div>待機中...</div>}
    </div>
  );
}