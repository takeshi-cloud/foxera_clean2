"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ImportButton from "./components/ImportButton";
import TradeJournalTable from "./components/TradeJournalTable";
import TradeJournalFilters from "./components/TradeJournalFilters";

import { TradeJournal } from "@/lib/trade/journal/types";

import {
  listTradeJournals,
  deleteTradeJournal,
  toggleTradeJournalAnalyzed,
} from "@/lib/trade/journal/service/tradeJournalService";

import { buildTradeJournalDisplay } from "@/lib/trade/journal/builder/journalTableBuilder";

export default function TradeJournalPage() {
  const router = useRouter();

  const [journals, setJournals] = useState<
    TradeJournal[]
  >([]);

  const [yearFilter, setYearFilter] =
    useState("");

  const [monthFilter, setMonthFilter] =
    useState("");

  const [symbolFilter, setSymbolFilter] =
    useState("");

  const [resultFilter, setResultFilter] =
    useState("");

  const [directionFilter, setDirectionFilter] =
    useState("");

  /* =========================================
     Initial Load
  ========================================= */
  useEffect(() => {
    loadJournals();
  }, []);

  /* =========================================
     Load Journals
  ========================================= */
  const loadJournals = async () => {
    try {
      const data =
        await listTradeJournals();

      setJournals(data);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================
     Filtered Journals
  ========================================= */
  const filtered = useMemo(() => {
    return journals.filter((j) => {
      const date = new Date(j.entry_time);

      const year = String(
        date.getFullYear()
      );

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      return (
        (!yearFilter ||
          year === yearFilter) &&
        (!monthFilter ||
          month === monthFilter) &&
        (!symbolFilter ||
          j.symbol === symbolFilter) &&
        (!resultFilter ||
          j.result === resultFilter) &&
        (!directionFilter ||
          j.direction ===
            directionFilter)
      );
    });
  }, [
    journals,
    yearFilter,
    monthFilter,
    symbolFilter,
    resultFilter,
    directionFilter,
  ]);

  /* =========================================
     Display Builder
  ========================================= */
  const displayJournals =
    buildTradeJournalDisplay(filtered);

  /* =========================================
     Filter Options
  ========================================= */
  const uniqueSymbols = [
    ...new Set(
      journals.map((j) => j.symbol)
    ),
  ];

  const uniqueYears = [
    ...new Set(
      journals.map((j) =>
        String(
          new Date(
            j.entry_time
          ).getFullYear()
        )
      )
    ),
  ];

  /* =========================================
     Delete
  ========================================= */
  const handleDelete = async (
    id: string
  ) => {
    const ok = confirm(
      "本当に削除しますか？"
    );

    if (!ok) return;

    try {
      await deleteTradeJournal(id);

      await loadJournals();
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================
     Toggle Analyzed
  ========================================= */
  const handleToggleAnalyzed =
    async (
      id: string,
      value: boolean
    ) => {
      try {
        await toggleTradeJournalAnalyzed(
          id,
          value
        );

        await loadJournals();
      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================
     Render
  ========================================= */
  return (
    <div
      style={{
        padding: 24,
        background: "#000",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  }}
>
  <h1
    style={{
      fontSize: 24,
      margin: 0,
    }}
  >
    トレード日誌一覧
  </h1>

  <button
    onClick={() =>
      window.location.href =
        "/home"
    }
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 6,
      padding: "6px 14px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    HOME
  </button>
</div>

      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          marginBottom: 15,
          flexWrap: "wrap",
        }}
      >
        <ImportButton
          userId="926655e5-129d-4f05-943b-dd702b662271"
          onImported={loadJournals}
        />

        <TradeJournalFilters
          yearFilter={yearFilter}
          monthFilter={monthFilter}
          symbolFilter={symbolFilter}
          resultFilter={resultFilter}
          directionFilter={directionFilter}
          uniqueYears={uniqueYears}
          uniqueSymbols={uniqueSymbols}
          onYearChange={setYearFilter}
          onMonthChange={setMonthFilter}
          onSymbolChange={setSymbolFilter}
          onResultChange={setResultFilter}
          onDirectionChange={
            setDirectionFilter
          }

          
        />

        <button
  onClick={() =>
    router.push("/chart")
  }
  style={{
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
  }}
>
  新規
</button>
      </div>

      <TradeJournalTable
        journals={displayJournals}
        onOpenJournal={(id) =>
          router.push(
            `/chart?journalId=${id}`
          )
        }
        onDelete={handleDelete}
        onToggleAnalyzed={
          handleToggleAnalyzed
        }
      />
    </div>
  );
}