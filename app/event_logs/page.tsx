"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createLog } from "@/lib/workflow/core/logEngine"; // 🔥 ログ統一入口

import EventTable from "./components/EventTable";
import FiltersBar from "./components/FiltersBar";
import PreviewPanel from "./components/PreviewPanel";

// 👉 Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const router = useRouter();

  // 👉 元データ（event_logs）
  const [eventLogs, setEventLogs] = useState<any[]>([]);

  // 👉 編集用state（UI操作はここに反映）
  const [forms, setForms] = useState<any>({});

  // 👉 選択行
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 👉 フィルター群
  const [pairFilter, setPairFilter] = useState("ALL");
  const [tfFilter, setTfFilter] = useState("ALL");
  const [tfTypeFilter, setTfTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [rangeFilter, setRangeFilter] = useState("ALL");
  const [imgFilter, setImgFilter] = useState("ALL");

  // 👉 ペア候補（固定）
  const pairOptions = ["USDJPY", "EURUSD", "GBPUSD", "AUDUSD", "その他"];

  // =====================================
  // 🔄 読み込み（DB → state）
  // =====================================
  const load = async () => {
    const { data } = await supabase
      .from("event_logs")
      .select("*")
      .order("event_time", { ascending: false });

    setEventLogs(data || []);

    // 👉 DBデータ → formsへ変換（編集用）
    const f: any = {};
    data?.forEach((row) => {
      f[row.id] = {
        date: row.event_time?.split("T")[0] || "",
        pair: row.pair,
        time: row.event_time?.split("T")[1]?.slice(0, 5) || "",
        timeframe: row.timeframe,
        timeframe_type: row.timeframe_type,
        direction: row.direction,
        phase: row.phase,
        notes: row.note,
        image_url: row.image_url,
      };
    });
    setForms(f);
  };

  // 👉 初回ロード
  useEffect(() => {
    load();
  }, []);

  // =====================================
  // 🔍 フィルタ（UI用データ生成）
  // =====================================
  const filtered = eventLogs.filter((s) => {
    const f = forms[s.id]; // 👉 編集状態を参照
    if (!f) return false;

    if (pairFilter !== "ALL" && f.pair !== pairFilter) return false;
    if (tfFilter !== "ALL" && f.timeframe !== tfFilter) return false;
    if (tfTypeFilter !== "ALL" && f.timeframe_type !== tfTypeFilter) return false;
    if (dateFilter !== "ALL" && f.date !== dateFilter) return false;

    // 👉 画像有無フィルタ
    if (imgFilter === "HAS" && !s.image_url) return false;
    if (imgFilter === "NONE" && s.image_url) return false;

    return true;
  });

  // =====================================
  // 🔄 フォーム更新（UI変更のみ）
  // =====================================
  const updateField = (id: string, key: string, value: any) => {
    setForms((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  // =====================================
  // 🗑 削除（DB直接）
  // =====================================
  const handleDelete = async (s: any) => {
    await supabase.from("event_logs").delete().eq("id", s.id);
    await load();
  };

  // =====================================
  // 🔥 更新（delete → createLog）
  // =====================================
  const [message, setMessage] = useState("");

  const handleUpdate = async (s: any) => {
    const f = forms[s.id];

    if (!f) {
      console.error("❌ form missing:", s.id);
      return;
    }

    // ① 既存ログ削除
    const { error: deleteError } = await supabase
      .from("event_logs")
      .delete()
      .eq("id", s.id);

    if (deleteError) {
      console.error("❌ delete error:", deleteError);
      return;
    }

    // ② 新規ログ作成（統一ルート）
    await createLog(
      {
        user_id: s.user_id,
        pair: f.pair,

        timeframe_type: f.timeframe_type,

        direction: f.direction,
        phase: f.phase,

        timeframe: f.timeframe,

        image_url: f.image_url ?? null,

        action: "log_update",
      },
      "board_action" // 👉 source指定（重要）
    );

    // ③ 再読み込み
    await load();

    // ④ UI通知
    setMessage("更新しました");
    setTimeout(() => setMessage(""), 2000);
  };

  // =====================================
  // 🖼 画像差し替え（UIのみ）
  // =====================================
  const handleReplaceImage = (e: any, s: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    // 👉 formsだけ更新（まだDBには保存されない）
    setForms((prev: any) => ({
      ...prev,
      [s.id]: {
        ...prev[s.id],
        image_url: url,
      },
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "10px",
      }}
    >
      <div style={{ display: "flex", marginBottom: "12px" }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => router.push("/home")}
            style={{
              padding: "10px 16px",
              background: "#334155",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            ← HOME
          </button>

          {/* 👉 フィルターUI */}
          <FiltersBar
            pairFilter={pairFilter}
            setPairFilter={setPairFilter}
            tfFilter={tfFilter}
            setTfFilter={setTfFilter}
            tfTypeFilter={tfTypeFilter}
            setTfTypeFilter={setTfTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            rangeFilter={rangeFilter}
            setRangeFilter={setRangeFilter}
            imgFilter={imgFilter}
            setImgFilter={setImgFilter}
            eventLogs={eventLogs}
            pairOptions={pairOptions}
          />
        </div>

        {/* 👉 画像プレビュー */}
        <PreviewPanel
          selectedIndex={selectedIndex}
          filtered={filtered}
          forms={forms}
        />
      </div>

      {/* 👉 編集テーブル */}
      <EventTable
        filtered={filtered}
        forms={forms}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        updateField={updateField}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
        handleReplaceImage={handleReplaceImage}
      />
    </div>
  );
}