"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import HistoryContent from "./HistoryContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}