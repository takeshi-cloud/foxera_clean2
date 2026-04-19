export type RadarUnit = {
  level: number;     // -3〜+3
  value: number;     // 価格
  position: number;  // -1〜+1（←実際はこれ）
};

export type Radar = {
  symbol: string; // 🔥 修正（pair → symbol）
  price: number;

  daily: RadarUnit;
  weekly: RadarUnit;

  created_at?: string;
};