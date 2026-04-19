// 👉 フィルター状態をまとめて受け取る
type Props = {
  pairFilter: string;
  setPairFilter: (v: string) => void;
  tfFilter: string;
  setTfFilter: (v: string) => void;
  tfTypeFilter: string;
  setTfTypeFilter: (v: string) => void;
  dateFilter: string;
  setDateFilter: (v: string) => void;
  rangeFilter: string;
  setRangeFilter: (v: string) => void;

  // 👇 画像有無フィルター
  imgFilter: string;
  setImgFilter: (v: string) => void;

  eventLogs: any[];     // 👉 元データ（ここから選択肢生成）
  pairOptions: string[]; // 👉 ペア一覧（外部から渡される）
};

export default function FiltersBar({
  pairFilter,
  setPairFilter,
  tfFilter,
  setTfFilter,
  tfTypeFilter,
  setTfTypeFilter,
  dateFilter,
  setDateFilter,
  rangeFilter,
  setRangeFilter,

  imgFilter,
  setImgFilter,

  eventLogs,
  pairOptions,
}: Props) {

  // 👉 共通スタイル
  const bigSelect = {
    padding: "8px 10px",
    background: "#1e293b",
    color: "white",
    borderRadius: "6px",
    border: "1px solid #334155",
    fontSize: "14px",
  };

  // 👉 event_logsから日付一覧を生成（重複除去）
  const dates = Array.from(
    new Set(eventLogs.map((s) => s.event_time?.split("T")[0]))
  );

  // 👉 event_logsからTF一覧を生成（重複除去）
  const timeframes = Array.from(
    new Set(eventLogs.map((s) => s.timeframe))
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        background: "#1e293b",
        borderRadius: "8px",
        border: "1px solid #334155",
      }}
    >
      {/* ペア */}
      <select
        value={pairFilter}
        onChange={(e) => setPairFilter(e.target.value)} // 👉 フィルター更新
        style={bigSelect}
      >
        <option value="ALL">ペア：すべて</option>
        {pairOptions.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      {/* TF */}
      <select
        value={tfFilter}
        onChange={(e) => setTfFilter(e.target.value)}
        style={bigSelect}
      >
        <option value="ALL">TF：すべて</option>
        {timeframes.map((tf) => (
          <option key={tf}>{tf}</option>
        ))}
      </select>

      {/* TF_type */}
      <select
        value={tfTypeFilter}
        onChange={(e) => setTfTypeFilter(e.target.value)}
        style={bigSelect}
      >
        <option value="ALL">TF_type：すべて</option>
        <option value="long">long</option>
        <option value="short">short</option>
      </select>

      {/* 日付 */}
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={bigSelect}
      >
        <option value="ALL">日付：すべて</option>
        {dates.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      {/* 期間 */}
      <select
        value={rangeFilter}
        onChange={(e) => setRangeFilter(e.target.value)}
        style={bigSelect}
      >
        <option value="ALL">期間：すべて</option>
        <option value="7">直近7日</option>
        <option value="30">直近30日</option>
        <option value="90">直近90日</option>
      </select>

      {/* 👇 画像有無フィルター */}
      <select
        value={imgFilter}
        onChange={(e) => setImgFilter(e.target.value)}
        style={bigSelect}
      >
        <option value="ALL">IMG：すべて</option>
        <option value="HAS">画像あり</option>
        <option value="NONE">画像なし</option>
      </select>
    </div>
  );
}