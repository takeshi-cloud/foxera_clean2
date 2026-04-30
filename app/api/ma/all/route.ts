export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { MARKETS } from "@/lib/constants/markets";
import { runOnePairMA } from "@/lib/ma/builders/runOnePairMA";

// =========================================
// スリープ関数（0.5秒）
// =========================================
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  try {
    const now = new Date();

    console.log("🕒 API NOW (UTC):", now.toISOString());

    const results = [];

    for (const m of MARKETS) {
      try {
        const result = await runOnePairMA(m.label, now);
        results.push(result);

        // =========================================
        // 🔥 API負荷対策（500ms待機）
        // =========================================
        await sleep(200);

      } catch (err) {
        console.error("MA ALL ERROR:", m.label, err);

        results.push({
          pair: m.label,
          error: true,
        });
      }
    }

    return NextResponse.json({
      now: now.toISOString(),
      results,
    });

  } catch (error) {
    console.error("MA ERROR:", error);

    return NextResponse.json(
      { error: "failed" },
      { status: 200 }
    );
  }
}