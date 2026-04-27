"use client";

import { useMAStore } from "@/lib/store/maStore";

export default function DebugMAPage() {
  const data = useMAStore((s) => s.data);

  return (
    <div className="bg-black text-green-400 p-4 min-h-screen text-xs font-mono">
      <h1 className="text-white text-lg mb-4">
        🔍 MA FULL DEBUG
      </h1>

      {data.length === 0 && (
        <div className="text-gray-400">
          データなし（更新ボタン押して）
        </div>
      )}

      {data.map((row, i) => (
        <div
          key={i}
          className="mb-8 border-b border-gray-700 pb-4"
        >
          {/* ===== HEADER ===== */}
          <div className="text-white mb-2">
            ■ {row.pair}
          </div>

          {/* ===== CORE ===== */}
          <div>price: {row.price}</div>

          <div>ma_now_15: {row.ma_now_15}</div>
          <div>ma_prev_15: {row.ma_prev_15}</div>

          <div>ma_now_1h: {row.ma_now_1h}</div>
          <div>ma_prev_1h: {row.ma_prev_1h}</div>

          <div>ma_now_4h: {row.ma_now_4h}</div>
          <div>ma_prev_4h: {row.ma_prev_4h}</div>

          <div className="mt-2">
            structure: {row.structure_order?.join(" > ")}
          </div>

          <div className="mb-2">
            base_time: {row.base_time}
          </div>

          {/* ===== DEBUG ===== */}
          <div className="text-yellow-400 mt-3">
            --- DEBUG ---
          </div>

          <div>bars_used: {row.debug?.bars_used}</div>

          <div>bar_15_now: {row.debug?.bar_15_now}</div>
          <div>bar_15_prev: {row.debug?.bar_15_prev}</div>

          <div>bar_1h_now: {row.debug?.bar_1h_now}</div>
          <div>bar_1h_prev: {row.debug?.bar_1h_prev}</div>

          <div>bar_4h_now: {row.debug?.bar_4h_now}</div>
          <div>bar_4h_prev: {row.debug?.bar_4h_prev}</div>

          {/* ===== RANGE ===== */}
          <div className="text-blue-400 mt-3">
            --- RANGE ---
          </div>

          <div>
            15M:
            {row.debug?.ma15_source_range?.from} →
            {row.debug?.ma15_source_range?.to}
          </div>

          <div>
            1H:
            {row.debug?.ma1h_source_range?.from} →
            {row.debug?.ma1h_source_range?.to}
          </div>

          <div>
            4H:
            {row.debug?.ma4h_source_range?.from} →
            {row.debug?.ma4h_source_range?.to}
          </div>

          {/* ===== RAW ===== */}
          <div className="text-gray-500 mt-3">
            --- RAW ---
          </div>

          <pre className="whitespace-pre-wrap text-[10px]">
            {JSON.stringify(row, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}