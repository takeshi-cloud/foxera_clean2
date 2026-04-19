export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { buildMAStructure } from "@/lib/ma/builders/buildMAStructure";

export async function GET(
  req: NextRequest
) {
  try {
    const pair =
      req.nextUrl.searchParams.get(
        "pair"
      ) || "USD/JPY";

    const result =
      await buildMAStructure(pair);

    return NextResponse.json({
      pair,
      result,
    });
  } catch (error) {
    console.error(
      "❌ MA Debug Error:",
      error
    );

    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}