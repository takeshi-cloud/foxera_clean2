export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { buildMAStructure } from "@/lib/ma/builders/buildMAStructure";

export async function GET(
  req: NextRequest
) {
  try {
    const pair =
      req.nextUrl.searchParams.get("pair") || "USD/JPY";

    // 🔥 これを追加
    const now = new Date();

    const result =
      await buildMAStructure(pair, now);

    return NextResponse.json({
      pair,
      now: now.toISOString(), // ついでに返すと便利
      result,
    });

  } catch (error) {
    console.error("❌ MA Debug Error:", error);

    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}