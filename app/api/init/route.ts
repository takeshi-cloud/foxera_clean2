import { NextResponse } from "next/server";
import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";
import { MARKETS } from "@/lib/constants/markets";

export async function GET() {
  console.log("🚀 INIT START");

  for (const m of MARKETS) {
    console.log("▶ INIT:", m.label);

    await fetchAndSave(
      m.label,
      "5m",
      undefined,
      undefined,
      10 // ← ★50→10に減らす
    );

    // 🔥 API制限回避
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("✅ INIT DONE");

  return NextResponse.json({ ok: true });
}