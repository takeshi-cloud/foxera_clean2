import { supabase } from "@/lib/infra/supabase";

export const saveMarketData = async (
  table: string,
  rows: any[]
) => {
  if (!rows?.length) return;

  const formatted = rows
    .map((r) => {
      const open = Number(r.open);
      const high = Number(r.high);
      const low = Number(r.low);
      const close = Number(r.close);

      if (
        isNaN(open) ||
        isNaN(high) ||
        isNaN(low) ||
        isNaN(close) ||
        !r.timestamp_utc
      ) {
        return null;
      }

      return {
        symbol: r.symbol,
        open,
        high,
        low,
        close,
        timestamp_utc: new Date(r.timestamp_utc).toISOString(),
      };
    })
    .filter(Boolean);

  if (!formatted.length) {
    console.warn("⚠️ no valid rows");
    return;
  }

  // =========================================
  // dedupe
  // =========================================
  const uniqueMap = new Map<string, any>();

  for (const r of formatted) {
    const key = `${r.symbol}_${r.timestamp_utc}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, r);
    }
  }

  const deduped = Array.from(uniqueMap.values());

  console.log("🧹 rows:", formatted.length, "→", deduped.length);

  // =========================================
  // save
  // =========================================
  const { data, error } = await supabase
    .from(table)
    .upsert(deduped, {
      onConflict: "symbol,timestamp_utc",
    })
    .select();

  if (error) {
    console.error("❌ saveMarketData error:", error);
    throw error;
  }

  console.log("💾 sample:", deduped[0]?.symbol);
  console.log("✅ inserted:", data?.length);
};