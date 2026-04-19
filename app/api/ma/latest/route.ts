export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getLatestMAStructures } from "@/lib/ma/storage/getLatestMAStructures";

export async function GET() {
  const rows =
    await getLatestMAStructures();

  const baseTime =
    rows?.[0]?.base_time || null;

  return NextResponse.json({
    rows,
    baseTime,
  });
}