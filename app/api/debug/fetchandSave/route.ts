import { fetchAndSave } from "@/lib/market/ingest/fetchAndSave";

export async function GET() {
  const MARKET = "USD/JPY";

  try {
    await fetchAndSave(
      MARKET,
      "1h",
      "2024-01-01",
      new Date().toISOString().slice(0, 10)
    );

    return Response.json({ ok: true });

  } catch (e: any) {
    return Response.json({
      error: e?.message || String(e),
    });
  }
}