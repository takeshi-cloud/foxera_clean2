"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { buildJournalPayload } from "../builders/buildJournalPayload";

export function useDetailJournal() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const journalId =
    searchParams.get(
      "journalId"
    );

  const [tradeInfo, setTradeInfo] =
    useState({
      symbol: "",
      entryDate: "",
      entryTime: "",
      exitDate: "",
      exitTime: "",
      holdingTime: "",
      pair: "",
      direction: "LONG",
      result: "",
      size: "",
      pips: "",
      profit: "",
    });

  const [notes, setNotes] =
    useState([
      {
        title: "エントリー前分析",
        text: "",
      },
      {
        title: "エントリー根拠",
        text: "",
      },
      {
        title: "反省点",
        text: "",
      },
      {
        title: "改善点",
        text: "",
      },
    ]);

  const [chartState, setChartState] =
    useState<any>(null);

  //----------------------------------------
  // Load
  //----------------------------------------
  useEffect(() => {
    loadJournalDisplay();
  }, [journalId]);

  const loadJournalDisplay =
    async () => {
      const query = journalId
        ? `/api/trade-journal/display?journalId=${journalId}`
        : `/api/trade-journal/display?mode=new`;

      const res = await fetch(query);

      if (!res.ok)
        throw new Error();

      const json =
        await res.json();

      setTradeInfo(json.tradeInfo);
      setNotes(json.notes);
      setChartState(json.chartState);
    };

  //----------------------------------------
  // Save
  //----------------------------------------
  const saveJournal =
    async () => {
      const payload =
        buildJournalPayload({
          tradeInfo,
          notes,
          chartState,
        });

      const method =
        journalId
          ? "PATCH"
          : "POST";

      const url = journalId
        ? `/api/trade-journal/${journalId}`
        : `/api/trade-journal`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      });

      if (!res.ok)
        throw new Error();

      const saved =
  await res.json();

alert(
  journalId
    ? "更新しました"
    : "新規作成しました"
);

if (!journalId) {
  router.replace(
    `/chart?journalId=${saved.id}`
  );
}
    };

  //----------------------------------------
  // Clear
  //----------------------------------------
  const clearJournal =
    async () => {
      if (!journalId) return;

      const ok = confirm(
        "分析内容とチャート設定をクリアしますか？"
      );

      if (!ok) return;

      const res = await fetch(
        `/api/trade-journal/${journalId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            entry_analysis: "",
            entry_reason: "",
            reflection: "",
            improvement: "",
            chart_state: "none",
            chart_state_json: {},
          }),
        }
      );

      if (!res.ok)
        throw new Error();

      await loadJournalDisplay();
    };

  //----------------------------------------
  // Note Update
  //----------------------------------------
  const updateNote = (
    index: number,
    key: string,
    value: string
  ) => {
    const next = [...notes];
    next[index][key] = value;
    setNotes(next);
  };

  return {
    journalId,

    tradeInfo,
    setTradeInfo,

    notes,
    updateNote,

    chartState,
    setChartState,

    saveJournal,
    clearJournal,
  };
}