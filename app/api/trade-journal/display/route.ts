export const dynamic = "force-dynamic";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { detailJournalPageBuilder } from "@/lib/trade/detailJournal/builder/detailJournalPageBuilder";
import { createNewDetailJournalBuilder } from "@/lib/trade/detailJournal/builder/createNewDetailJournalBuilder";

export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const journalId =
      searchParams.get(
        "journalId"
      );

    const isNew =
      searchParams.get("mode") ===
      "new";

    if (isNew) {
      return NextResponse.json(
        createNewDetailJournalBuilder()
      );
    }

    if (!journalId) {
      return NextResponse.json(
        {
          error:
            "journalId is required",
        },
        { status: 400 }
      );
    }

    const result =
      await detailJournalPageBuilder(
        journalId
      );

    return NextResponse.json(
      result
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          "Failed to load detail journal",
      },
      { status: 500 }
    );
  }
}