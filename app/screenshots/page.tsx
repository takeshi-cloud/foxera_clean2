"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/infra/supabase";
import { MARKETS } from "@/lib/constants/markets";

export default function ScreenshotsPage() {
  const [list, setList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [range, setRange] = useState("7d");
  const [symbolFilter, setSymbolFilter] = useState<string[]>([]);

  // =========================
  // 📦 取得
  // =========================
  const load = async () => {
    const { data } = await supabase
      .from("screenshots")
      .select("*")
      .order("date", { ascending: false });

    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // 🔍 フィルター
  // =========================
  useEffect(() => {
    let result = [...list];

    // --- 期間 ---
    if (range !== "all") {
      const now = new Date();
      let past = new Date();

      if (range === "7d") past.setDate(now.getDate() - 7);
      if (range === "1m") past.setMonth(now.getMonth() - 1);
      if (range === "3m") past.setMonth(now.getMonth() - 3);

      result = result.filter(
        (item) => new Date(item.date) >= past
      );
    }

    // --- シンボル ---
    if (symbolFilter.length > 0) {
      result = result.filter((item) =>
        symbolFilter.includes(item.symbol)
      );
    }

    setFiltered(result);
  }, [list, range, symbolFilter]);

  // =========================
  // 🗑 削除
  // =========================
  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;

    await supabase
      .from("screenshots")
      .delete()
      .eq("id", id);

    if (selected?.id === id) setSelected(null);

    load();
  };

  // =========================
  // ✏️ 保存
  // =========================
  const handleSave = async (item: any) => {
    await supabase
      .from("screenshots")
      .update({
        symbol: item.symbol,
        date: item.date,
        note: item.note,
        type: item.type,
      })
      .eq("id", item.id);

    load();
  };

  // =========================
  // 🎯 全てボタン
  // =========================
  const toggleAllSymbols = () => {
    if (symbolFilter.length === MARKETS.length) {
      setSymbolFilter([]); // 全解除
    } else {
      setSymbolFilter(MARKETS.map((m) => m.key)); // 全選択
    }
  };

  // =========================
  // 🎯 UI
  // =========================
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#020617",
        color: "white",
        fontSize: 13,
      }}
    >
      {/* =========================
          左：一覧
      ========================= */}
      <div
        style={{
          width: 520,
          borderRight: "1px solid #1e293b",
          overflowY: "auto",
        }}
      >
        {/* フィルター */}
        <div style={{ padding: 8 }}>
          {/* 🔥 全てボタン */}
          <button
            onClick={toggleAllSymbols}
            style={{
              marginBottom: 6,
              background: "#334155",
            }}
          >
            全て
          </button>

          {/* シンボル */}
          <div>
            {MARKETS.map((m) => (
              <label key={m.key} style={{ marginRight: 8 }}>
                <input
                  type="checkbox"
                  checked={symbolFilter.includes(m.key)}
                  onChange={() => {
                    setSymbolFilter((prev) =>
                      prev.includes(m.key)
                        ? prev.filter((s) => s !== m.key)
                        : [...prev, m.key]
                    );
                  }}
                />
                {m.key}
              </label>
            ))}
          </div>

          {/* 期間 */}
          <div style={{ marginTop: 8 }}>
            {["7d", "1m", "3m", "all"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  marginRight: 6,
                  background:
                    range === r ? "#334155" : "#020617",
                }}
              >
                {r === "7d" && "1週間"}
                {r === "1m" && "1ヶ月"}
                {r === "3m" && "3ヶ月"}
                {r === "all" && "全て"}
              </button>
            ))}
          </div>
        </div>

        {/* 一覧 */}
        {filtered.map((item) => (
          <div
            key={item.id}
           onClick={() => {
  console.log("clicked", item.id);
  setSelected({ ...item });
}}
            style={{
              padding: "6px 8px",
              borderBottom: "1px solid #0f172a",
              background:
                selected?.id === item.id
                  ? "#1e293b"
                  : "transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <input
                type="date"
                value={item.date || ""}
                onChange={(e) =>
                  (item.date = e.target.value)
                }
                style={{ width: 110 }}
              />

              <select
                value={item.symbol}
                onChange={(e) =>
                  (item.symbol = e.target.value)
                }
              >
                {MARKETS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.key}
                  </option>
                ))}
              </select>

              <input
                value={item.type || ""}
                placeholder="TYPE"
                onChange={(e) =>
                  (item.type = e.target.value)
                }
                style={{ width: 70 }}
              />

              <input
                value={item.note || ""}
                onChange={(e) =>
                  (item.note = e.target.value)
                }
                style={{ flex: 1 }}
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(item);
                }}
              >
                保存
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                style={{ color: "red" }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          右：プレビュー
      ========================= */}
      <div style={{ flex: 1, padding: 20 }}>
        {!selected && <div>選択してください</div>}

        {selected && (
          <>
            {/* 🔥 安全表示 */}
            {selected.image_url ? (
              <img
                src={selected.image_url}
                style={{
                  maxWidth: "100%",
                  marginBottom: 16,
                }}
              />
            ) : (
              <div style={{ opacity: 0.5 }}>
                画像なし
              </div>
            )}

            <div>
              {selected.symbol} / {selected.date}
            </div>

            <div style={{ marginTop: 10 }}>
              {selected.note}
            </div>
          </>
        )}
      </div>
    </div>
  );
}