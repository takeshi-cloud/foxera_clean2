export async function fetchOHLC(
  symbol: string,
  interval: string,
  options: {
    outputsize?: number;
    from?: string;
    to?: string;
  } = {}
) {
  const { outputsize = 500, from, to } = options;

  console.log("🔥 fetchOHLC input:", {
    symbol,
    interval,
    options,
  });

  if (!symbol) {
    throw new Error("❌ symbol undefined in fetchOHLC");
  }

  const apiSymbol = symbol;

  const intervalMap: Record<string, string> = {
    "5m": "5min",
    "15m": "15min",
    "1h": "1h",
    "4h": "4h",
    "1day": "1day",
    "1week": "1week",
  };

  const apiInterval = intervalMap[interval] || interval;

  const url = new URL("https://api.twelvedata.com/time_series");

  url.searchParams.append("symbol", apiSymbol);
  url.searchParams.append("interval", apiInterval);

  // 🔥 範囲指定がある場合はoutputsizeを使わない
  if (!from && !to) {
    url.searchParams.append("outputsize", String(outputsize));
  }

  url.searchParams.append(
    "apikey",
    process.env.NEXT_PUBLIC_TWELVEDATA_KEY!
  );

  // 🔥 ここが修正ポイント（超重要）
 if (from) {
  url.searchParams.append("start_date", from);
}

if (to) {
  url.searchParams.append("end_date", to);
}

  console.log("🌐 FETCH URL:", url.toString());

  const res = await fetch(url.toString());

  console.log("🔥 fetch status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ fetchOHLC HTTP error:", text);
    return [];
  }

  const data = await res.json();

  console.log("🔥 RAW datetime sample:", data?.values?.[0]?.datetime);
  console.log("🔥 RAW full sample:", data?.values?.[0]);

  if (data.status === "error") {
    console.error("❌ TwelveData Error:", data);
    throw new Error(data.message);
  }

  if (!data.values?.length) {
    console.warn("⚠️ no values:", {
      apiSymbol,
      apiInterval,
      from,
      to,
    });
    return [];
  }

  console.log("✅ values count:", data.values.length);

  return data.values.map((d: any, i: number) => {
    if (i < 10) {
      console.log("CHECK", {
        datetime: d.datetime,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      });
    }

    // 🔥 UTCとして固定解釈
    const utc = new Date(d.datetime + "Z");

    return {
      symbol,
      timestamp_utc: utc.toISOString(),
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
      volume: d.volume ? Number(d.volume) : null,
    };
  });
}