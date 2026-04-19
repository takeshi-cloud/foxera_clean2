"use client";

import { useState } from "react";
import { TradeImport } from "@/lib/trade/import/types";

type Props = {
  trades: TradeImport[];
  onClose: () => void;
  onSave: (selected: TradeImport[]) => void;
};

export default function ImportPreviewModal({
  trades,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] =
    useState<boolean[]>(trades.map(() => true));

  const toggle = (index: number) => {
    setSelected((prev) =>
      prev.map((v, i) =>
        i === index ? !v : v
      )
    );
  };

  const handleSave = () => {
    const selectedTrades = trades.filter(
      (_, i) => selected[i]
    );

    onSave(selectedTrades);
  };

  return (
    <div className="fixed inset-0 bg-black/50 p-8">
      <div className="bg-white text-black p-4 rounded">
        <h2>どのトレードを取り込みますか？</h2>

        <div className="space-y-2 mt-4">
          {trades.map((trade, i) => (
            <div
              key={trade.ticket}
              className="flex gap-2"
            >
              <input
                type="checkbox"
                checked={selected[i]}
                onChange={() => toggle(i)}
              />

              <span>
                {trade.symbol} / {trade.direction} /
                {trade.profitPips}pips / {trade.result}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleSave}>
            保存
          </button>

          <button onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}