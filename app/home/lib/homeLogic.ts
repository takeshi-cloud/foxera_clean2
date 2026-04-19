// =========================================
// HOME専用ロジックまとめ（修正版）
// =========================================
import { fetchBoards } from "@/lib/workflow/board/boardService";
import { createLog } from "@/lib/workflow/core/logEngine";
import { PAIRS } from "@/lib/constants/LogOptions";

//---------------------------------------------
// 初期card作成（修正版）
//---------------------------------------------
export const ensureInitialBoards = async (user_id: string) => {

  // 👉 現在のboard取得
  const boards = await fetchBoards(user_id);

  for (const pair of PAIRS) {

    // 🔥 pair × HTF の存在チェック
    const existsHTF = boards.some(
      (b: any) =>
        b.pair === pair &&
        b.timeframe_type === "HTF"
    );

    // 🔥 無ければ初期WAIT生成（ログ経由）
    if (!existsHTF) {
      console.log("🆕 create initial:", pair);

      await createLog(
        {
          user_id,
          pair,
          timeframe_type: "HTF",
          phase: "Wait",
          action: "move_to_wait",
        },
        "system" // 👉 自動生成ログ
      );
    }
  }
};

// =============================
// 🔹 通貨正規化
// =============================
export const normalizePair = (pair: string) =>
  pair?.replace("/", "").toUpperCase(); // 👉 比較用に統一

// =============================
// 🔹 フェーズ順ソート
// =============================
export const sortByPhase = (a: any, b: any) => {
  const priority = (p: string) => {
    if (p === "Trigger") return 0;
    if (p === "Pullback") return 1;
    return 2;
  };
  return priority(a.phase) - priority(b.phase); // 👉 表示順制御
};

// =============================
// 🔹 長期・短期分割
// =============================
export const splitBoards = (boards: any[]) => {

  // 👉 HTF
  const longBoards = boards.filter(
    (b) => b.timeframe_type === "HTF"
  );

  // 👉 LTF
  const shortBoards = boards.filter(
    (b) => b.timeframe_type === "LTF"
  );

  return { longBoards, shortBoards };
};


// =============================
// 🔹 初期配置
// =============================
export function getInitialBoardPlacement({
  timeframeType,
  direction,
}: {
  timeframeType: string;
  direction: string;
}) {
  return {
    row: timeframeType === "HTF" ? 0 : 1,   // 👉 上段 or 下段
    col: direction === "long" ? 0 : 1,      // 👉 左 or 右
  };
}

//---------------------------------
//　Direction(long,short)フィルター（新）
//---------------------------------

// 👉 UI用フィルター（こちらを使う想定）
export const filterByDirection = (
  boards: any[],
  showLong: boolean,
  showShort: boolean
) => {
  return boards.filter((b) => {
    if (!showLong && b.direction === "long") return false;
    if (!showShort && b.direction === "short") return false;
    return true;
  });
};