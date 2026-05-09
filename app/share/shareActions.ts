// app/share/shareActions.ts

import { supabase } from "@/lib/infra/supabase";
import { createLog } from "@/lib/workflow/core/logEngine";
import {
  ACTIONS,
  LOG_SOURCES,
} from "@/lib/constants/LogOptions";

const USER_ID =
  "926655e5-129d-4f05-943b-dd702b662271";

// =====================================
// 🔥 timeframe → HTF / LTF 自動判定
// =====================================
const getTimeframeType = (
  timeframe: string
) => {
  const htf = [
    "1H",
    "4H",
    "1D",
    "1W",
    "1M",
  ];

  return htf.includes(timeframe)
    ? "HTF"
    : "LTF";
};

// =====================================
// 💾 保存（share専用）
// =====================================
export const saveSharedScreenshot =
  async ({
    file,
    pair,
    date,

    direction,
    timeframe,
    phase,
  }: {
    file: File;
    pair: string;
    date: string;

    direction?: string | null;
    timeframe?: string | null;
    phase?: string | null;
  }) => {
    // ===============================
    // validation
    // ===============================
    if (!file || !pair) {
      throw new Error(
        "pair or file missing"
      );
    }

    // ===============================
    // Storage upload
    // ===============================
    const fileName =
      `${pair}_${Date.now()}.png`;

    const { error } =
      await supabase.storage
        .from("screenshots")
        .upload(fileName, file);

    if (error) {
      throw error;
    }

    // ===============================
    // public url
    // ===============================
    const { data } =
      supabase.storage
        .from("screenshots")
        .getPublicUrl(fileName);

    const imageUrl =
      data.publicUrl;

    // ===============================
    // screenshot保存
    // ===============================
   await supabase
  .from("screenshots")
  .insert({
    symbol: pair,
    path: fileName,
    date,
  });

    // ==================================
    // 🔥 詳細入力なし
    // screenshotsだけ保存
    // ==================================
    const hasDetail =
      direction &&
      timeframe &&
      phase;

    if (!hasDetail) {
      return {
        success: true,
        mode: "screenshot-only",
      };
    }

    // ===============================
    // HTF / LTF
    // ===============================
    const timeframeType =
      getTimeframeType(
        timeframe
      );

    // ===============================
    // event_log保存
    // ===============================
   await createLog(
  {
    user_id: USER_ID,

    pair,

    timeframe,
    timeframe_type:
      timeframeType,

    direction,
    phase,

    action:
      ACTIONS[5],

    force_update: true,
  },
  LOG_SOURCES[1]
);

    return {
      success: true,
      mode: "with-log",
    };
  };