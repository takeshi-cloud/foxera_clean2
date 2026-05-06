export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { fetchOHLC } from "@/lib/market/ingest/fetchMarketData";

const OFFSET_MS = 10 * 60 * 60 * 1000;

export async function GET() {
  try {
    const symbol = "USD/JPY";

    // =========================================
    // 🔥 fetchAndSave比較用
    // =========================================
    const tests = [
      // =====================================
      // DATE ONLY
      // =====================================
      {
        label: "DATE_ONLY_SINGLE_DAY",
        tf: "1h",

        start: "2026-05-05",
        end: "2026-05-05",
      },

      {
        label: "DATE_ONLY_MULTI_DAY",
        tf: "1h",

        start: "2026-05-05",
        end: "2026-05-05",
      },

      // =====================================
      // ISO UTC
      // =====================================
      {
        label: "ISO_UTC_DAY_RANGE",
        tf: "1h",

        start: "2026-05-05T00:00:00Z",
        end: "2026-05-06T00:00:00Z",
      },

      {
        label: "ISO_UTC_PIVOT_RANGE",
        tf: "1h",

        // NY daily想定
        start: "2026-05-05T21:00:00Z",
        end: "2026-05-06T21:00:00Z",
      },

      // =====================================
      // +10h request
      // =====================================
      {
        label: "ISO_PLUS_10H_REQUEST",
        tf: "1h",

        start: "2026-05-05T07:00:00Z",
        end: "2026-05-06T07:00:00Z",
      },

    ];

    const results = [];

    for (const t of tests) {
      console.log("\n=================================");
      console.log("🧪 TEST:", t.label);

      console.log("📡 REQUEST", {
        tf: t.tf,
        start: t.start,
        end: t.end,
      });

      const data = await fetchOHLC(symbol, t.tf, {
        from: t.start,
        to: t.end,
        outputsize: 5000,
      });

      console.log("📦 FETCH COUNT:", data?.length);

      const rows =
        data?.map((d: any, i: number) => {
          // =====================================
          // API RAW
          // =====================================
          const raw = d.raw_datetime;

          // =====================================
          // fetchOHLC後
          // =====================================
          const afterZ = d.timestamp_utc;

          // =====================================
          // save時 -10h想定
          // =====================================
          const afterSave = new Date(
            new Date(afterZ).getTime() - OFFSET_MS
          ).toISOString();

          return {
            no: i + 1,

            // API raw
            raw_datetime: raw,

            // fetchOHLC後
            after_z: afterZ,

            // save後想定
            after_save_minus10h: afterSave,

            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          };
        }) || [];

      // =====================================
      // console table
      // =====================================
      console.table(rows);

      // =====================================
      // first / last
      // =====================================
      const first = rows[0];
      const last = rows[rows.length - 1];

      console.log("📍 RANGE SUMMARY", {
        first_raw: first?.raw_datetime,
        last_raw: last?.raw_datetime,

        first_after_z: first?.after_z,
        last_after_z: last?.after_z,

        first_after_save:
          first?.after_save_minus10h,

        last_after_save:
          last?.after_save_minus10h,
      });

      results.push({
        label: t.label,

        request: {
          start: t.start,
          end: t.end,
        },

        count: rows.length,

        first: first || null,
        last: last || null,

        rows,
      });
    }

    return NextResponse.json({
      ok: true,
      symbol,
      tests: results,
    });
  } catch (e) {
    console.error("❌ TEST ERROR:", e);

    return NextResponse.json(
      {
        ok: false,
        error: String(e),
      },
      { status: 500 }
    );
  }
}