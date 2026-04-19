
"use client";


import JournalChartSection from "./components/JournalChartSection";
import { TradeResultPanel } from "./components/TradeResultPanel";
import { NotesPanel } from "@/app/chart/components/NotesPanel";
import JournalHeaderActions from "./components/JournalHeaderActions";

import { useDetailJournal } from "./hooks/useDetailJournal";

export default function ChartPage() {
  const {
    journalId,
    tradeInfo,
    setTradeInfo,
    notes,
    updateNote,
    chartState,
    setChartState,
    saveJournal,
    clearJournal,
  } = useDetailJournal();

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        background: "black",
      }}
    >
      <h2>
        {journalId
          ? "トレード詳細＆日誌"
          : "新規トレード日誌作成"}
      </h2>

      <JournalHeaderActions
        journalId={journalId}
        onSave={saveJournal}
        onClear={clearJournal}
      />

      <div
        style={{
          display: "flex",
          gap: 20,
        }}
      >
        {chartState && (
          <JournalChartSection
            initialChartState={
              chartState
            }
            onChartStateChange={
              setChartState
            }
          />
        )}

        <TradeResultPanel
          tradeInfo={tradeInfo}
          setTradeInfo={
            setTradeInfo
          }
        />
      </div>

      <NotesPanel
        notes={notes}
        updateNote={updateNote}
      />
    </div>
  );
}