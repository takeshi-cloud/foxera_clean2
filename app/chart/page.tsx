export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ClientChartPage from "./ClientChartPage";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ClientChartPage />
    </Suspense>
  );
}