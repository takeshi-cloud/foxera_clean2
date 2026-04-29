"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BoardCard } from "../cards/BoardCard";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Row } from "./Row";
import { QuickUploadModal } from "@/components/screenshot/QuickUploadModal";

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

  // =============================
  // 🔥 追加：スマホ判定（これだけ）
  // =============================
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  console.log("boards raw:", boards);

  const phases = PHASES.slice(1);

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
    if (phase === "Trigger") return "#eab308";
    if (phase === "Pullback") return "#06b6d4";
    return "#0f172a";
  };

  const [showLong, setShowLong] = useState(true);
  const [showShort, setShowShort] = useState(true);

  const filteredLongBoards = filterByDirection(longBoards, showLong, showShort);
  const filteredShortBoards = filterByDirection(shortBoards, showLong, showShort);

  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();

  const sortFn = (a: any, b: any) => {
    const p = (x: string) =>
      x === "Trigger" ? 0 : x === "Pullback" ? 1 : 2;
    return p(a.phase) - p(b.phase);
  };

  const [openQuickUpload, setOpenQuickUpload] = useState(false);

  // =============================
  // 🔥 ここだけ調整値
  // =============================
  const PADDING = isMobile ? "4px" : "12px";
  const GAP = isMobile ? "4px" : "12px";
  const SECTION_GAP = isMobile ? "6px" : "12px";

  return (
    <div style={{ flex: 1, padding: PADDING, color: "white" }}>

      {/* ================= 現在の状況 ================= */}

      <h3>現在の状況</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: GAP,
        }}
      >
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
          gap: GAP,
          marginTop: "16px",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>①HTF</h3>

        <span style={{ fontSize: "11px", color: "#b0c0d6", marginLeft: "8px" }}>
          FILTER
        </span>

        <div style={{ display: "flex", gap: isMobile ? "4px" : "6px" }}>
          <button
            onClick={() => setShowLong(!showLong)}
            style={{
              background: showLong ? "#22c55e" : "#1e293b",
              color: showLong ? "white" : "#64748b",
              padding: isMobile ? "3px 6px" : "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            LONG
          </button>

          <button
            onClick={() => setShowShort(!showShort)}
            style={{
              background: showShort ? "#ef4444" : "#1e293b",
              color: showShort ? "white" : "#64748b",
              padding: isMobile ? "3px 6px" : "4px 10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            SHORT
          </button>
        </div>

<div
  onClick={() => setOpenQuickUpload(true)}
  style={{
    marginLeft: "26px",
    padding: "4px 14px",
    borderRadius: "8px",
    background: "#0e5be9", // ← 青系（未使用）
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  Screenshots Upload
</div>

      </div>

      <div style={{ display: "flex", gap: GAP }}>
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
                    padding: isMobile ? 4 : 8,
                    border: "1px solid #334155",
                  }}
                >
                  <h4 style={{ marginBottom: isMobile ? 4 : 8 }}>{phase}</h4>

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

      <div style={{ display: "flex", gap: GAP }}>
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
                    padding: isMobile ? 4 : 8,
                    border: "1px solid #334155",
                  }}
                >
                  <h4 style={{ marginBottom: isMobile ? 4 : 8 }}>{phase}</h4>

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

   {/* ================= Quick Upload ================= */}
      <QuickUploadModal
        open={openQuickUpload}
        onClose={() => setOpenQuickUpload(false)}
      />



    </div>
  );
};