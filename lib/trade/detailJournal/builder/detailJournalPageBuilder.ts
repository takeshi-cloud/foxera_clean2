import { getDetailJournal } from "../service/detailJournalService";

import { buildTradeJournalDetails } from "./buildTradeJournalDetails";
import { buildDetailJournalNotes } from "./buildDetailJournalNotes";
import { buildChartState } from "./buildChartState";

export async function detailJournalPageBuilder(
  journalId: string
) {
  const journal =
    await getDetailJournal(
      journalId
    );

  return {
    tradeInfo:
      buildTradeJournalDetails(
        journal
      ),

    notes:
      buildDetailJournalNotes(
        journal
      ),

    chartState:
      buildChartState(
        journal
      ),
  };
}