import { NextResponse } from "next/server";

import { MARKETS } from "@/lib/constants/markets";
import { runOnePairMA } from "@/lib/ma/runOnePairMA";

export async function GET() {
  try {
    const results = [];

    for (const m of MARKETS) {
      try {
        const result =
          await runOnePairMA(
            m.label
          );

        results.push(result);
      } catch (err) {
        console.error(
          "MA ALL ERROR:",
          m.label,
          err
        );

        results.push({
          pair: m.label,
          error: true,
        });
      }
    }

    return NextResponse.json(
      results
    );
  } catch (error) {
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}