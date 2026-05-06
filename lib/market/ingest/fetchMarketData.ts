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

  const url = new URL(
    "https://api.twelvedata.com/time_series"
  );

  url.searchParams.append("symbol", apiSymbol);
  url.searchParams.append("interval", apiInterval);

  // 🔥 範囲指定がある場合はoutputsizeを使わない
  if (!from && !to) {
    url.searchParams.append(
      "outputsize",
      String(outputsize)
    );
  }

  url.searchParams.append(
    "apikey",
    process.env.NEXT_PUBLIC_TWELVEDATA_KEY!
  );

  // =========================================
  // 🔥 request
  // =========================================
  if (from) {
    url.searchParams.append("start_date", from);
  }

  if (to) {
    url.searchParams.append("end_date", to);
  }

  console.log("🌐 FETCH URL:", url.toString());

  // =========================================
  // 🔥 fetch
  // =========================================
  const res = await fetch(url.toString());

  console.log("🔥 fetch status:", res.status);

  // =========================================
  // 🔥 RAW RESPONSE TEXT
  // =========================================
  const text = await res.text();

  
  // JSON parse
  const data = JSON.parse(text);

  // =========================================
  // 🔥 HTTP ERROR
  // =========================================
  if (!res.ok) {
    console.error(
      "❌ fetchOHLC HTTP error:",
      text
    );

    return [];
  }

  // =========================================
  // 🔥 RAW API RESPONSE
  // =========================================
  console.log(
    "========== RAW API RESPONSE =========="
  );

  console.log(
    JSON.stringify(
      data?.values?.slice(0, 20),
      null,
      2
    )
  );

  console.log(
    "======================================"
  );

 

  // =========================================
  // 🔥 API ERROR
  // =========================================
  if (data.status === "error") {
    console.error(
      "❌ TwelveData Error:",
      data
    );

    throw new Error(data.message);
  }

  // =========================================
  // 🔥 no data
  // =========================================
  if (!data.values?.length) {
    console.warn("⚠️ no values:", {
      apiSymbol,
      apiInterval,
      from,
      to,
    });

    return [];
  }

 

  // =========================================
  // 🔥 format
  // =========================================
  return data.values.map((d: any) => {

    // 🔥 UTC固定解釈
    const utc = new Date(
      d.datetime + "Z"
    );

    console.log("🕒 CONVERT", {
      raw: d.datetime,
      afterZ: utc.toISOString(),
    });

    return {
      symbol,

      // 🔥 API raw
      raw_datetime: d.datetime,

      // 🔥 加工後
      timestamp_utc:
        utc.toISOString(),

      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),

      volume: d.volume
        ? Number(d.volume)
        : null,
    };
  });
}