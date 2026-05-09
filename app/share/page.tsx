"use client";

import { Suspense } from "react";
import ShareForm from "./ShareForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShareForm />
    </Suspense>
  );
}