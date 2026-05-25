import { NextResponse }
from "next/server";

import { fetchLatestBar }
from "../../../../lib/market/ingest/fetchLatestBar";

export async function GET() {
  try {
    console.log(
      "🚀 START USDJPY"
    );

    const latest =
      await fetchLatestBar(
        "USD/JPY",
        "1h"
      );

    // ====================
    // Discord通知
    // ====================
    await fetch(
      process.env
        .DISCORD_WEBHOOK!,
      {
        method:"POST",
        headers:{
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          content:
`🔥 USDJPY updated

close:
${latest.close}

time:
${latest.timestamp_utc}`
        })
      }
    );

    console.log(
      "✅ USDJPY updated"
    );

    return NextResponse.json({
      ok: true
    });

  } catch (e) {
    console.error(
      "❌ CRON ERROR",
      e
    );

    return NextResponse.json(
      {
        ok: false
      },
      {
        status: 500
      }
    );
  }
}