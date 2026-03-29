"use client";

import { getMarketData } from "../lib/api/getMarketData";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { useBoards } from "../lib/useBoards";
import { splitBoards } from "../lib/boardUtils";
import {
  moveToWait,
  createShort,
  toggleDirection,
  removeBoard,
} from "../lib/boardActions";

import { insertBoard, updateBoard } from "../lib/boardService";

import { LeftPanel } from "./components/LeftPanel";
import { CenterPanel } from "./components/CenterPanel";
import { RightPanel } from "./components/RightPanel";

export default function Home() {
  // 安全に取得
  const boardsHook = useBoards() || {};
  const boards = boardsHook.boards ?? [];
  const load = boardsHook.load ?? (() => {});
  const shots = boardsHook.shots ?? [];
  const loadShots = boardsHook.loadShots ?? (() => {});
  const hasScreenshot = boardsHook.hasScreenshot ?? (() => false);

  const [activePair, setActivePair] = useState<string | null>(null);
  const [market, setMarket] = useState<any>(null);

  const loadMarket = async (pair: string) => {
    try {
      const data = await getMarketData(pair);
      setMarket(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 安全に分解
  const { wait = [] } = splitBoards(boards) || {};

  const [newPair, setNewPair] = useState("");
  const [cursor, setCursor] = useState(0);

  const getPriceByCursor = (basePrice: number, cursor: number) => {
    return basePrice + cursor;
  };

  // 安全にmap
  const mergedBoards = (wait ?? []).map((pair: string) => {
    return {
      id: pair,
      pair,
      price: getPriceByCursor(market?.price ?? 0, cursor),
    };
  });

  useEffect(() => {
    if (activePair) {
      loadMarket(activePair);
    }
  }, [activePair]);

  const onDragEnd = async (result: any) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const item = (boards ?? []).find(
      (b: any) => b?.id?.toString() === draggableId
    );

    if (!item) {
      if (destination.droppableId?.startsWith("long-")) {
        const pair = draggableId;
        await insertBoard(pair.toUpperCase());
        await load();
      }
      return;
    }

    const fromType = item.timeframe_type;

    let toType = "";
    if (destination.droppableId?.startsWith("long-")) toType = "long";
    else if (destination.droppableId?.startsWith("short-")) toType = "short";
    else if (destination.droppableId === "wait") toType = "wait";

    if (
      (fromType === "long" && toType === "short") ||
      (fromType === "short" && toType === "long")
    ) {
      return;
    }

    if (fromType === "short" && toType === "wait") return;

    if (destination.droppableId === "wait") {
      await moveToWait(item);
      await load();
      return;
    }

    if (destination.droppableId?.startsWith("long-")) {
      const phase = destination.droppableId.replace("long-", "");
      const current = (boards ?? []).find((b) => b?.id === draggableId);
      if (!current) return;

      await updateBoard(
        draggableId,
        {
          timeframe_type: "long",
          phase,
        },
        current
      );
      await load();
      return;
    }

    if (destination.droppableId?.startsWith("short-")) {
      const phase = destination.droppableId.replace("short-", "");
      const current = (boards ?? []).find((b) => b?.id === draggableId);
      if (!current) return;

      await updateBoard(
        draggableId,
        {
          timeframe_type: "short",
          phase,
        },
        current
      );
      await load();
      return;
    }
  };

  const addPair = async () => {
    if (!newPair) return;
    setNewPair("");
    load();
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: "flex",
            height: "100vh",
            minWidth: "1100px",
            background: "#020617",
          }}
        >
          <div
            style={{
              width: "180px",
              borderRight: "1px solid #334155",
              overflow: "hidden",
            }}
          >
            <LeftPanel
              wait={mergedBoards}
              market={market}
              cursor={cursor}
              setCursor={setCursor}
              newPair={newPair}
              setNewPair={setNewPair}
              addPair={addPair}
              load={load}
              actions={{
                createShort,
                toggleDirection,
                moveToWait,
                removeBoard,
              }}
            />
          </div>

          <div
            style={{
              width: "800px",
              borderRight: "1px solid #334155",
              overflow: "hidden",
            }}
          >
            <CenterPanel
              boards={boards}
              screenshots={shots}
              load={load}
              activePair={activePair}
              setActivePair={setActivePair}
              actions={{
                createShort,
                toggleDirection,
                moveToWait,
                removeBoard,
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
            }}
          >
            <RightPanel market={market} />
          </div>
        </div>
      </DragDropContext>

      <div style={{ color: "white", padding: "10px" }}>
        <div>activePair: {activePair}</div>
        <div>market: {JSON.stringify(market)}</div>
        <div>price: {market?.price}</div>
      </div>
    </>
  );
}