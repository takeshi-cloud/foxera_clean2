// =========================================
// event_logservice.ts（完成版）
// =========================================

import { supabase } from "@/lib/infra/supabase";

export const insertEventLog = async (data: any) => {
  const { error } = await supabase.from("event_logs").insert([
    {
      ...data,

      direction: data.direction ?? "unknown",
      phase: data.phase ?? "unknown",
    },
  ]);

  if (error) {
    console.error("❌ insertEventLog error:", error);
  }
};