import { useEffect, useMemo, useState } from "react";
import { EventLog } from "./types";
import { createClient } from "@supabase/supabase-js";

// 👉 Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useEventLogs = () => {

  // 👉 元データ（event_logs）
  const [logs, setLogs] = useState<EventLog[]>([]);

  // 👉 フィルター状態
  const [filters, setFilters] = useState({
    pair: "",
    tf: "",
  });

  // ★ DBから取得（初回のみ）
  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("event_logs")
        .select("*")
        .order("event_time", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      // ★ DB → UI用にキー変換（重要）
      const normalized: EventLog[] = data.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        pair: row.pair,
        tf: row.timeframe,            // 👉 命名変換
        tfType: row.timeframe_type,
        dir: row.direction,
        phase: row.phase,
        note: row.note,
        mode: row.mode,
        action: row.action,
        event_time: row.event_time,
        image_url: row.image_url,
      }));

      setLogs(normalized);
    };

    fetchLogs();
  }, []);

  // 👉 フィルター適用（再計算）
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filters.pair && log.pair !== filters.pair) return false;
      if (filters.tf && log.tf !== filters.tf) return false;
      return true;
    });
  }, [logs, filters]);

  // 👉 更新（UIのみ・DB未反映）
  const updateLog = async (updated: EventLog) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
  };

  // 👉 削除（UIのみ・DB未反映）
  const deleteLog = async (target: EventLog) => {
    setLogs((prev) => prev.filter((l) => l.id !== target.id));
  };

  // 👉 追加（UIのみ・DB未反映）
  const uploadLog = async (newLog: EventLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  return {
    logs,
    filtered,
    filters,
    setFilters,
    updateLog,
    deleteLog,
    uploadLog,
  };
};