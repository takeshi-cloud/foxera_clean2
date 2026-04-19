export const dynamic = "force-dynamic";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createTradeJournal } from "@/lib/trade/journal/service/tradeJournalService";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const { userId, importedTrades } = body;

    const result =
      await createTradeJournal(
        userId,
        importedTrades
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Create failed" },
      { status: 500 }
    );
  }
}