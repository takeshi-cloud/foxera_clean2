import { getRadarHistory } from "../infra/getRadarHistory";
import { getLatestPerPair } from "../selectors/getLatestPerPair";

export const getRadarScatter = async (market: string) => {
  const rows = await getRadarHistory(market);

  const latestPerPair = getLatestPerPair(rows);

  const result = latestPerPair.map((r: any) => ({
    pair: r.symbol, // ← 表示用だけpairにしてOK
    x: r.x,
    y: r.y,
    timestamp: r.timestamp,
  }));

  return result;
};