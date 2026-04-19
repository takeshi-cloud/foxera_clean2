// =========================================
// 🟦 監視候補（WAIT の母集団）
// =========================================
// WAIT は DB に保存しないので、
// 「監視候補の全ペア」から board に存在しないペアを WAIT として扱う。
//
// 必要に応じて増やしてOK。
// （ユーザーが追加する WAIT ペアは別管理でもOK）
const ALL_PAIRS = [
  "USDJPY",
  "EURJPY",
  "GBPJPY",
  "GBPUSD",
  "EURUSD",
  "GOLD",
  "NASDAQ",
];


// =========================================
// 🟥 分類（LONG / SHORT / WAIT）
// =========================================
export const splitBoards = (boards: any[] = []) => {
  // WAIT以外（表示対象）
  const activeBoards = boards.filter(b => b.phase !== "Wait");

  const long = activeBoards.filter(b => b.timeframe_type === "long");
  const short = activeBoards.filter(b => b.timeframe_type === "short");

  // WAIT（phaseで管理）
  const wait = boards
    .filter(b => b.phase === "Wait" && b.pair)
    .map(b => b.pair);

  return { long, short, wait };
};


// =========================================
// 🟩 フィルター（方向フィルター）
// =========================================
export const filterBoards = (boards: any[], filter: string) => {
  if (filter === "all") return boards;
  return boards.filter(b => b.direction === filter);
};


// =========================================
// 🟨 フェーズ抽出（フェーズごとに抽出）
// =========================================
export const getPhaseBoards = (boards: any[], phase: string, filter: string) => {
  return filterBoards(boards, filter).filter(b => b.phase === phase);
};


// =========================================
// 🟧 状況生成（LONG/SHORT の状態一覧）
// =========================================
// WAIT は DB に存在しないので対象外。
// board に存在するペアだけを対象にする。
export const buildStatus = (boards: any[] = []) => {
 const pairs = Array.from(new Set(boards.map(b => b.pair)));

  return pairs.map(pair => {
    const long = boards.find(b => b.pair === pair && b.timeframe_type === "long");
    const short = boards.find(b => b.pair === pair && b.timeframe_type === "short");

    return {
      pair,
      longPhase: long?.phase || "-",
      shortPhase: short?.phase || "-",
      longDir: long?.direction || "-",
      shortDir: short?.direction || "-"
    };
  });
};