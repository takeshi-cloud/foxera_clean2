export const fetchPrice = async (symbol: string) => {
  // 🔥 統一（変換しない）
  const apiSymbol = symbol;

  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${apiSymbol}` +
    `&interval=1min` +
    `&outputsize=1` +
    `&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_KEY}`;

  console.log("🌐 FETCH URL:", url);

  // ===============================
  // ① HTTPチェック
  // ===============================
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 429) {
      console.error("🚨 RATE LIMIT:", text);
      throw new Error("Rate limit exceeded");
    }

    console.error("❌ HTTP ERROR:", res.status, text);
    throw new Error(`HTTP error ${res.status}`);
  }

  const data = await res.json();

  // ===============================
  // ② APIチェック
  // ===============================
  if (data?.status !== "ok") {
    console.error("❌ API ERROR:", data);
    throw new Error("TwelveData API error");
  }

  if (!Array.isArray(data.values)) {
    console.error("❌ INVALID STRUCTURE:", data);
    throw new Error("Invalid response structure");
  }

  const value = data.values[0];

  if (!value) {
    throw new Error("No values in response");
  }

  const price = Number(value.close);

  // ===============================
  // ③ 時間処理
  // ===============================
  if (!value.datetime) {
    throw new Error("Missing datetime");
  }

  const dataTime = new Date(value.datetime + "Z");

  if (isNaN(dataTime.getTime())) {
    throw new Error("Invalid datetime format");
  }

  const now = new Date();

  // ===============================
  // ④ 数値チェック
  // ===============================
  if (!price || isNaN(price)) {
    throw new Error("Invalid price");
  }

  // ===============================
  // ⑤ 鮮度チェック
  // ===============================
  const diffMin =
    (now.getTime() - dataTime.getTime()) / 60000;

  const day = now.getUTCDay();
  const isWeekend = day === 0 || day === 6;

  if (diffMin > 10 && !isWeekend) {
    throw new Error("Stale price data");
  }

  if (diffMin < -1) {
    throw new Error("Future price data");
  }

  // ===============================
  // ⑥ 正常返却
  // ===============================
  return {
    symbol,
    price,
    timestamp_utc: dataTime.toISOString(),
  };
};