"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BoardCard } from "../cards/BoardCard";
import { useState } from "react";
import { Header } from "./Header";
import { Row } from "./Row";

import {
  PHASES,
  TIMEFRAME_TYPES,
} from "@/lib/constants/LogOptions";

// =============================
type Board = {
  id: string;
  pair: string;
  phase: string;
  direction: "long" | "short";
  timeframe_type: string;
};

// =============================
// 🔥 ロジック（UIから分離）
// =============================
const filterByDirection = (
  boards: Board[],
  showLong: boolean,
  showShort: boolean
) => {
  return boards.filter((b) => {
    if (!showLong && b.direction === "long") return false;
    if (!showShort && b.direction === "short") return false;
    return true;
  });
};

export const CenterPanel = ({
  boards,
  screenshots,
  activePair,
  setActivePair,
  onToggleDirection,
  onRemove,
  onMoveToWait,
  onCreateShort,
  onUpdateTF,
}: any) => {

  console.log("boards raw:", boards);

  // 🔥 Wait除外
  const phases = PHASES.slice(1);

  // 🔥 HTF / LTF分類
  const longBoards = boards.filter(
    (b: Board) =>
      b.timeframe_type === TIMEFRAME_TYPES[0] ||
      b.timeframe_type === "HTF" ||
      b.timeframe_type === "long"
  );  
  const shortBoards = boards.filter(
    (b: Board) =>
      b.timeframe_type === TIMEFRAME_TYPES[2] ||
      b.timeframe_type === "LTF" ||
      b.timeframe_type === "short"
  );

  const getPhaseBg = (phase: string) => {
  if (phase === "Trigger") return "#eab308";   // 薄い黄色
  if (phase === "Pullback") return "#06b6d4"; // 薄い水色
  return "#0f172a"; // デフォルト
};




  

  // =============================
  // 🔥 UI状態
  // =============================
  const [showLong, setShowLong] = useState(true);
  const [showShort, setShowShort] = useState(true);

  // 👉 フィルタ適用（ここで一回だけ）
  const filteredLongBoards = filterByDirection(longBoards, showLong, showShort);
  const filteredShortBoards = filterByDirection(shortBoards, showLong, showShort);

  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();

  const sortFn = (a: any, b: any) => {
    const p = (x: string) =>
      x === "Trigger" ? 0 : x === "Pullback" ? 1 : 2;
    return p(a.phase) - p(b.phase);
  };

  return (
    <div style={{ flex: 1, padding: "12px", color: "white" }}>

      {/* ================= 現在の状況 ================= */}

      <h3>現在の状況</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <Header />
          {[...filteredLongBoards]
            .sort(sortFn)
            .filter((_, i) => i % 2 === 0)
            .map((card) => (
              <Row
                key={card.id}
                card={card}
                shortBoards={filteredShortBoards}
                activePair={activePair}
                setActivePair={setActivePair}
              />
            ))}
        </div>

        <div>
          <Header />
          {[...filteredLongBoards]
            .sort(sortFn)
            .filter((_, i) => i % 2 === 1)
            .map((card) => (
              <Row
                key={card.id}
                card={card}
                shortBoards={filteredShortBoards}
                activePair={activePair}
                setActivePair={setActivePair}
              />
            ))}
        </div>
      </div>

      {/* ================= HTF ================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>①HTF</h3>

        <span style={{ fontSize: "11px", color: "#b0c0d6", marginLeft: "8px" }}>
          FILTER
        </span>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setShowLong(!showLong)}
            style={{
              background: showLong ? "#22c55e" : "#1e293b",
              color: showLong ? "white" : "#64748b",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: showLong ? "0 0 8px #22c55e88" : "none",
            }}
          >
            LONG
          </button>

          <button
            onClick={() => setShowShort(!showShort)}
            style={{
              background: showShort ? "#ef4444" : "#1e293b",
              color: showShort ? "white" : "#64748b",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: showShort ? "0 0 8px #ef444488" : "none",
            }}
          >
            SHORT
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {phases.map((phase) => {

          const items = filteredLongBoards.filter((b) => b.phase === phase);



          return (
            <Droppable key={phase} droppableId={`long-${phase}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    minHeight: 120,
                    background: getPhaseBg(phase),
                    borderRadius: 8,
                    padding: 8,
                    border: "1px solid #334155",
                  }}
                >
                  <h4>{phase}</h4>

                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                      {(provided) => (
                        <BoardCard
                          item={item}
                          screenshots={screenshots}
                          provided={provided}
                          active={normalize(activePair) === normalize(item.pair)}
                          onClick={() => setActivePair(item.pair)}
                          type="long"
                          onToggleDirection={onToggleDirection}
                          onRemove={onRemove}
                          onMoveToWait={onMoveToWait}
                          onCreateShort={onCreateShort}
                          onUpdateTF={onUpdateTF}
                        />
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>

      {/* ================= LTF ================= */}

      <h3 style={{ marginTop: 16 }}>②LTF</h3>

      <div style={{ display: "flex", gap: "12px" }}>
        {phases.map((phase) => {

          const items = filteredShortBoards.filter((b) => b.phase === phase);

          return (
            <Droppable key={phase} droppableId={`short-${phase}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    minHeight: 120,
                    background: getPhaseBg(phase),
                    borderRadius: 8,
                    padding: 8,
                    border: "1px solid #334155",
                  }}
                >
                  <h4>{phase}</h4>

                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                      {(provided) => (
                        <BoardCard
                          item={item}
                          screenshots={screenshots}
                          provided={provided}
                          active={normalize(activePair) === normalize(item.pair)}
                          onClick={() => setActivePair(item.pair)}
                          type="short"
                          onToggleDirection={onToggleDirection}
                          onRemove={onRemove}
                          onMoveToWait={onMoveToWait}
                          onCreateShort={onCreateShort}
                          onUpdateTF={onUpdateTF}
                        />
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>

    </div>
  );
};