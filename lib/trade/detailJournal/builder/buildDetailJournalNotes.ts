export function buildDetailJournalNotes(
  journal: any
) {
  return [
    {
      title: "エントリー前分析",
      text:
        journal.entry_analysis ?? "",
    },
    {
      title: "エントリー根拠",
      text:
        journal.entry_reason ?? "",
    },
    {
      title: "反省点",
      text:
        journal.reflection ?? "",
    },
    {
      title: "改善点",
      text:
        journal.improvement ?? "",
    },
  ];
}