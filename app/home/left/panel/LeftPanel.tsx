"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import Link from "next/link";

export const LeftPanel = ({
  wait,
  cursor,
  setCursor,
  onRemove,
}: any) => {

  const merged = wait.map((item: any) => {
    return {
      ...item,
      price: undefined, // ← market削除対応
    };
  });

  return (
    <Droppable droppableId="wait">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            height: "100vh",
            overflow: "hidden",
            padding: "12px",
            background: "#0f172a",
          }}
        >
          <h3 style={{ color: "white" }}>通貨ペア</h3>

          {/* スクロール領域 */}
          <div
            style={{
              height: "calc(100vh - 350px)",
              overflowY: "auto",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "8px",
              marginBottom: "12px",
            }}
          >
            {merged.map((item: any, index: number) => (
              <Draggable
                key={item.id}
                draggableId={item.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      background: "#334155",
                      padding: "8px",
                      borderRadius: "6px",
                      marginBottom: "6px",
                      color: "white",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        minWidth: "320px",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(item);
                        }}
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>

                      <b>{item.pair}</b>

                      <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        {item.price != null
                          ? Number(item.price).toFixed(3)
                          : "--"}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          </div>

          {provided.placeholder}

          {/* MENU */}
          <div>
            <div style={{ fontSize: "14px", opacity: 0.5 }}>MENU</div>

            <Link href="/upload"><div className="menuBtn">📤 アップロード</div></Link>
            <Link href="/event_logs"><div className="menuBtn">📊 EVENT_LOG</div></Link>
            <Link href="/login"><div className="menuBtn">🔏 ログイン</div></Link>
            <Link href="/trade-journal"><div className="menuBtn">📊 トレード記録日誌</div></Link>
            <Link href="/admin/fetch"><div className="menuBtn">📈 Price取得所</div></Link>
            <Link href="/pivot_research"><div className="menuBtn">🧠 PIVOT研究所</div></Link>
          </div>
        </div>
      )}
    </Droppable>
  );
};