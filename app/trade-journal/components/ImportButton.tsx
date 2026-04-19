"use client";

import { useState } from "react";
import { TradeImport } from "@/lib/trade/import/types";
import ImportPreviewModal from "./ImportPreviewModal";

import {
  runTradeImport,
  saveImportedTrades,
} from "@/lib/trade/import/builder/importBuilder";

type Props = {
  userId: string;
  onImported?: () => void;
};

export default function ImportButton({
  userId,
  onImported,
}: Props) {
  const [previewTrades, setPreviewTrades] =
    useState<TradeImport[]>([]);

  const [open, setOpen] =
    useState(false);

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file =
        e.target.files?.[0];

      if (!file) return;

      const trades =
        await runTradeImport(
          userId,
          file
        );

      setPreviewTrades(trades);
      setOpen(true);
    } catch (err) {
      console.error(
        "IMPORT ERROR:",
        err
      );
    }
  };

  const handleSave = async (
    selectedTrades: TradeImport[]
  ) => {
    try {
      await saveImportedTrades(
        userId,
        selectedTrades
      );

      setOpen(false);

      onImported?.();

      alert("Import Complete");
    } catch (err) {
      console.error(
        "SAVE ERROR:",
        err
      );
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFile}
      />

      {open && (
        <ImportPreviewModal
          trades={previewTrades}
          onClose={() =>
            setOpen(false)
          }
          onSave={handleSave}
        />
      )}
    </>
  );
}