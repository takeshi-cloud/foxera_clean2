import { supabase }
from "@/lib/infra/supabase";

const API_KEY =
  process.env
    .NEXT_PUBLIC_TWELVEDATA_KEY!;

const TF_MAP: Record<
  string,
  string
> = {
  "1h":"1h",
  "4h":"4h",
  "15m":"15min",
  "5m":"5min",
  "1d":"1day",
};

const TABLE_MAP: Record<
  string,
  string
> = {
  "1h":"ohlc_1h",
  "4h":"ohlc_4h",
  "15m":"ohlc_15m",
  "5m":"ohlc_5m",
  "1d":"ohlc_1d",
};

export async function
fetchLatestBar(
  symbol:string,
  tf:string
) {
  const interval =
    TF_MAP[tf];

  const table =
    TABLE_MAP[tf];

  if (!interval) {
    throw new Error(
      `unsupported tf ${tf}`
    );
  }

  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${encodeURIComponent(symbol)}` +
    `&interval=${interval}` +
    `&outputsize=1` +
    `&apikey=${API_KEY}`;

  const res =
    await fetch(url);

  const json =
  await res.json();

console.log(
  "🔥 TWELVE RESPONSE",
  json
);

  const raw =
    json?.values?.[0];

  if (!raw) {
    throw new Error(
      "no data"
    );
  }

  const rawTime =
    raw.datetime;

  const utc =
    new Date(
      rawTime + "Z"
    );

  // +10hズレ補正
  utc.setHours(
    utc.getHours() - 10
  );

  const row = {
    symbol,
    open:
      Number(raw.open),
    high:
      Number(raw.high),
    low:
      Number(raw.low),
    close:
      Number(raw.close),
    volume:
      raw.volume
        ? Number(
            raw.volume
          )
        : null,
    timestamp_raw:
      rawTime,
    timestamp_utc:
      utc.toISOString(),
  };

  console.log(
    "🔥 LATEST",
    row
  );

  const { error } =
    await supabase
      .from(table)
      .upsert(row, {
        onConflict:
          "symbol,timestamp_utc",
      });

  if (error) {
    throw error;
  }

  console.log(
    `✅ latest saved: ${table}`,
    symbol
  );

  return row;
}