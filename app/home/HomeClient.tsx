"use client";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { useBoards } from "@/lib/workflow/board/useBoards";

import dynamic from "next/dynamic";

const LeftPanel = dynamic(
  () => import("./left/panel/LeftPanel").then(m => m.LeftPanel),
  { ssr: false }
);
const CenterPanel = dynamic(
  () => import("./center/panels/CenterPanel").then(m => m.CenterPanel),
  { ssr: false }
);
const RightPanel = dynamic(
  () => import("./right/panel/RightPanel").then(m => m.RightPanel),
  { ssr: false }
);

import {
  handleToggleDirection,
  handleRemove,
  handleMoveToWait,
  handleCreateShort,
  handleUpdateTF,
  handleDnD,
} from "./lib/homeActions";

import { ensureInitialBoards } from "./lib/homeLogic";

// 🔥 追加
import { Clock } from "@/components/ui/Clock";

export default function HomeClient() {
  const { boards = [], load, shots = [] } =
    useBoards();

  const [activePair, setActivePair] =
    useState<string | null>(null);

  const [lastActivePair, setLastActivePair] =
    useState<string | null>(null);

  const [market] =
    useState<any>(null);

  const [cursor, setCursor] =
    useState(0);

const startY = useRef(0);
const currentY = useRef(0);

  // =====================================
  // 🔥 初回復元（localStorage）
  // =====================================
  useEffect(() => {
    const saved =
      localStorage.getItem("lastActivePair");

    if (saved) {
      setActivePair(saved);
      setLastActivePair(saved);
    }
  }, []);

  // =====================================
  // 🔥 active変更時に保存
  // =====================================
  useEffect(() => {
    if (activePair) {
      setLastActivePair(activePair);

      localStorage.setItem(
        "lastActivePair",
        activePair
      );
    }
  }, [activePair]);

  // =====================================
  // 初期ロード
  // =====================================
  useEffect(() => {
    const init = async () => {
      await load();

      const user = (
        await import(
          "@/lib/infra/supabase"
        )
      ).supabase.auth.getUser();

      const { data } =
        await user;

      const user_id =
        data?.user?.id;

      if (!user_id) return;

      await ensureInitialBoards(
        user_id
      );

      await load();
    };

    init();
  }, []);

  const waitBoards =
    boards.filter(
      (b) => b.phase === "Wait"
    );

  const mergedBoards =
    waitBoards.map(
      (item: any) => ({
        ...item,
        price:
          (market?.price ?? 0) +
          cursor,
      })
    );

  const onDragEnd =
    async (result: any) => {
      await handleDnD(
        result,
        boards,
        load
      );
    };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
  onTouchStart={(e) => {
  startY.current = e.touches[0].clientY;
}}
onTouchMove={(e) => {
  currentY.current = e.touches[0].clientY;
}}
onTouchEnd={() => {
  const diff = currentY.current - startY.current;

  if (diff > 220) {
    window.location.reload();
  }
}}
  style={{
    display: "flex",
    minHeight: "100%",
    background: "#020617",
    overflowX: "auto",
    width: "100%",
    overflowY: "auto",
  }}
>
        {/* LEFT */}
        <div
          style={{
            flex: "1.2 1 0%",
            minWidth: 140,
            maxWidth: 230,
            overflow: "auto",
            opacity: 0.6,
          }}
        >
          <LeftPanel
            wait={mergedBoards}
            market={market}
            cursor={cursor}
            setCursor={setCursor}
            activePair={activePair}
            setActivePair={setActivePair}
            onRemove={(item) => handleRemove(item, load, boards)}
          />
        </div>

        {/* CENTER */}
        <div
          style={{
           flex: "2 1 0%",
            minWidth: 500,
            maxWidth: 700,
            minHeight: "100%",
            overflowY: "auto",
          }}
        >
          <CenterPanel
            boards={boards}
            screenshots={shots}
            activePair={activePair}
            setActivePair={setActivePair}
            onToggleDirection={(item) =>
              handleToggleDirection(item, load)
            }
            onRemove={(item) => handleRemove(item, load, boards)}
            onMoveToWait={(item) =>
              handleMoveToWait(item, load, boards)
            }
            onCreateShort={(item) =>
              handleCreateShort(item, load, boards)
            }
            onUpdateTF={(item, tf) =>
              handleUpdateTF(item, tf, load)
            }
          />
        </div>

        {/* RIGHT */}
        <div
          style={{
           flex: "1 1 0%",
minWidth: 900,
            
            overflow: "flex",
          }}
        >
          <RightPanel
            activePair={activePair || lastActivePair}
              setActivePair={setActivePair}
          />
        </div>

        {/* 🔥 時計（完全分離） */}
        <div
  style={{
    position: "fixed",
    bottom: 10,
    left: 10,
    zIndex: 9999,
  }}
>
  <Clock />
</div>
      </div>
    </DragDropContext>
  );
}