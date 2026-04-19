export function buildChartState(
  journal: any
) {
  // 🔥 既存データ優先
  if (
    journal.chart_state_json &&
    Object.keys(
      journal.chart_state_json
    ).length > 0
  ) {
    return journal.chart_state_json;
  }

  // 🔥 entry安全化
  const entry = journal.entry_time
    ? new Date(journal.entry_time)
    : new Date();

  const exit = journal.exit_time
    ? new Date(journal.exit_time)
    : new Date(entry);

  // 🔥 -6 / +1
  const start = new Date(entry);
  start.setDate(start.getDate() - 6);

  const end = new Date(exit);
  end.setDate(end.getDate() + 1);

  // 🔥 日付フォーマット（ローカル維持）
  const format = (d: Date) =>
    `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return {
    symbol: journal.symbol,
    tf: "1h",
    startDate: format(start),
    endDate: format(end),
    showLine: true,
    showZigzag: true,
    zigzagDeviation: 0.03,
    zigzagDepth: 3,
  };
}