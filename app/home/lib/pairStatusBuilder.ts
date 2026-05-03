// =============================
// 🔥 共通
// =============================
export const normalizePair = (pair: string) =>
  pair?.replace("/", "").toUpperCase();

// =============================
// 🔥 StatusMap（MA + Pivot）
// =============================
export const buildStatusMap = (rows) => {
  const map = new Map();

  for (const r of rows) {
    map.set(normalizePair(r.pair), r);
  }

  return map;
};

// =============================
// 🔥 Boards + MA + Pivot 統合
// =============================
export const buildMergedPairs = (boards, statusMap) => {
  const pairMap = new Map();

  boards.forEach((b) => {
    const phase = (b.phase || "").trim();

    if (!phase || phase.toUpperCase() === "WAIT") return;

    const key = normalizePair(b.pair);

    if (!pairMap.has(key)) {
      pairMap.set(key, {
        HTF: null,
        LTF: null,
      });
    }

    const obj = pairMap.get(key);

    if (b.timeframe_type === "HTF" && !obj.HTF) {
      obj.HTF = b;
    }

    if (b.timeframe_type === "LTF" && !obj.LTF) {
      obj.LTF = b;
    }
  });

  return Array.from(pairMap.values()).map((p) => {
    const pair = p.HTF?.pair || p.LTF?.pair;
    const status = statusMap.get(normalizePair(pair));

    return {
      id: p.HTF?.id || p.LTF?.id,
      pair,

      // =============================
      // 🔥 Boards（絶対にそのまま）
      // =============================
      HTF: p.HTF,
      LTF: p.LTF,

      // =============================
      // 🔥 MA（右端専用）
      // =============================
      maDirection: status?.direction ?? null,
      maPhase: status?.phase ?? null,

      // =============================
      // 🔥 Pivot
      // =============================
      pivotY: status?.pivotY ?? null,
    };
  });
};

// =============================
// 🔥 フィルター（Boardsのみ）
// =============================
export const filterPairs = (pairs, showLong, showShort) => {
  return pairs.filter((p) => {
    const dir = p.HTF?.direction;

    if (!dir) return false;

    if (!showLong && dir === "long") return false;
    if (!showShort && dir === "short") return false;

    return true;
  });
};

// =============================
// 🔥 ソート（Boardsのみ）
// =============================
const sortBoards = (a, b) => {
  const dirOrder = {
    long: 0,
    short: 1,
  };

  const phaseOrder = {
    Trigger: 0,
    Pullback: 1,
    Trend: 2,
    Reversal: 3,
  };

  const dirDiff =
    (dirOrder[a.HTF?.direction] ?? 99) -
    (dirOrder[b.HTF?.direction] ?? 99);

  if (dirDiff !== 0) return dirDiff;

  return (
    (phaseOrder[a.HTF?.phase] ?? 99) -
    (phaseOrder[b.HTF?.phase] ?? 99)
  );
};

// =============================
// 🔥 表示用
// =============================
export const getDisplayPairs = (
  boards,
  statusMap,
  showLong,
  showShort
) => {
  const merged = buildMergedPairs(boards, statusMap);

  const sorted = [...merged].sort(sortBoards);

  return filterPairs(sorted, showLong, showShort);
};