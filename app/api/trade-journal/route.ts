export const dynamic = "force-dynamic";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createManualTradeJournal } from "@/lib/trade/journal/service/tradeJournalService";

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const result =
      await createManualTradeJournal(
        body
      );

    return NextResponse.json(
      result
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          "Create failed",
      },
      { status: 500 }
    );
  }
}