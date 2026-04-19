export const dynamic = "force-dynamic";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { updateTradeJournal } from "@/lib/trade/journal/service/tradeJournalService";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const body =
      await req.json();

    console.log(
      "PATCH BODY:",
      body
    );

    const result =
      await updateTradeJournal(
        params.id,
        body
      );

    return NextResponse.json(
      result
    );
  } catch (err: any) {
    console.error(
      "PATCH ERROR:",
      err
    );

    return NextResponse.json(
      {
        error:
          err.message ??
          "PATCH failed",
      },
      { status: 500 }
    );
  }
}