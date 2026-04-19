"use client";

import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { useBoards } from "@/lib/workflow/board/useBoards";

import { LeftPanel } from "./left/panel/LeftPanel";
import { CenterPanel } from "./center/panels/CenterPanel";
import { RightPanel } from "./right/panel/RightPanel";

import {
  handleToggleDirection,
  handleRemove,
  handleMoveToWait,
  handleCreateShort,
  handleUpdateTF,
  handleDnD,
} from "./lib/homeActions";

import { ensureInitialBoards } from "./lib/homeLogic";

export default function HomeClient() {
  const { boards = [], load, shots = [] } =
    useBoards();

  const [
    activePair,
    setActivePair,
  ] = useState<string | null>(null);

  const [market] =
    useState<any>(null);

  const [cursor, setCursor] =
    useState(0);

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
    <DragDropContext
      onDragEnd={onDragEnd}
    >
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#020617",
          overflow: "hidden",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            width: 180,
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <LeftPanel
            wait={mergedBoards}
            market={market}
            cursor={cursor}
            setCursor={setCursor}
            onRemove={(item) =>
              handleRemove(
                item,
                load
              )
            }
          />
        </div>

        {/* CENTER */}
        <div
          style={{
            width: 850,
            flexShrink: 0,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <CenterPanel
            boards={boards}
            screenshots={shots}
            activePair={
              activePair
            }
            setActivePair={
              setActivePair
            }
            onToggleDirection={(
              item
            ) =>
              handleToggleDirection(
                item,
                load
              )
            }
            onRemove={(item) =>
              handleRemove(
                item,
                load
              )
            }
            onMoveToWait={(
              item
            ) =>
              handleMoveToWait(
                item,
                load
              )
            }
            onCreateShort={(
              item
            ) =>
              handleCreateShort(
                item,
                load,
                boards
              )
            }
            onUpdateTF={(
              item,
              tf
            ) =>
              handleUpdateTF(
                item,
                tf,
                load
              )
            }
          />
        </div>

        {/* RIGHT */}
        <div
          style={{
            width: 1000,
            flexShrink: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <RightPanel />
        </div>
      </div>
    </DragDropContext>
  );
}