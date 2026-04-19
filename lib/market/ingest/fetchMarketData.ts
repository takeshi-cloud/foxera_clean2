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

  // 🔥 修正（統一）
  const apiSymbol = symbol;

  console.log("🔥 API symbol:", apiSymbol);

  const intervalMap: Record<string, string> = {
    "5m": "5min",
    "15m": "15min",
    "1h": "1h",
    "4h": "4h",
    "1day": "1day",
    "1week": "1week",
  };

  const apiInterval = intervalMap[interval] || interval;

  console.log("🔥 API interval:", apiInterval);

  const url = new URL("https://api.twelvedata.com/time_series");

  url.searchParams.append("symbol", apiSymbol);
  url.searchParams.append("interval", apiInterval);
  url.searchParams.append("outputsize", String(outputsize));
  url.searchParams.append(
    "apikey",
    process.env.NEXT_PUBLIC_TWELVEDATA_KEY!
  );

  if (from) {
    url.searchParams.append("start_date", `${from} 00:00:00`);
  }

  if (to) {
    url.searchParams.append("end_date", `${to} 23:59:59`);
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

  console.log("🔥 raw response:", data);

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

  return data.values.map((d: any) => {
    const utc = new Date(d.datetime);

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