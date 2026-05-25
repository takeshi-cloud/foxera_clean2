import { supabase } from "@/lib/infra/supabase";
import { getChartOHLC } from "../../market/ingest/getChartOHLC";
import { buildChartSeries } from "../transform/buildChartSeries";
import { fetchAndSave_range } from "../../market/ingest/fetchAndSave_range";

export const chartDataBuilder = async (
  symbol:string,
  tf:string,
  start:string,
  end:string
) => {
  let rows = await getChartOHLC(
    symbol,tf,start,end
  );

  // =========================================
  // 完全未取得
  // =========================================
  if (!rows?.length) {
    console.log("⚠️ no chart data → full fetch");

    await fetchAndSave_range(
      symbol,tf,start,end
    );

    let retry = 0;

    while (retry < 5) {
      rows = await getChartOHLC(
        symbol,tf,start,end
      );

      console.log(
        "🔁 retry(full)",
        retry,
        rows?.length
      );

      if (rows?.length) break;

      await new Promise(r =>
        setTimeout(r,200)
      );

      retry++;
    }

    const series =
      buildChartSeries(rows);

    const { data:pivots=[] } =
      await supabase
        .from("pivot_levels")
        .select("*")
        .eq("symbol",symbol)
        .eq("timeframe","weekly");

    return series.map(bar=>{
      const d =
        new Date(bar.time);

      const sunday =
        new Date(d);

      sunday.setDate(
        d.getDate() -
        d.getDay()
      );

      const weekKey =
        sunday
          .toISOString()
          .slice(0,10);

      const pivot =
        pivots.find(
          p =>
            p.source_week_start ===
            weekKey
        );

      return {
        ...bar,
        pp:pivot?.pivot ?? null,
        r1:pivot?.r1 ?? null,
        r2:pivot?.r2 ?? null,
        r3:pivot?.r3 ?? null,
        s1:pivot?.s1 ?? null,
        s2:pivot?.s2 ?? null,
        s3:pivot?.s3 ?? null,
      };
    });
  }

  // =========================================
  // 部分不足判定
  // =========================================
  const first =
    rows[0];

  const last =
    rows[rows.length - 1];

  const startMs =
    new Date(
      start + "T00:00:00Z"
    ).getTime();

  const endMs =
    new Date(
      end + "T23:59:59Z"
    ).getTime();

  const firstMs =
    new Date(
      first.timestamp_utc
    ).getTime();

  const lastMs =
    new Date(
      last.timestamp_utc
    ).getTime();

  const TF_MS_MAP:
    Record<string,number> = {
      "5m":300000,
      "15m":900000,
      "1h":3600000,
      "4h":14400000,
    };

  const ONE_BAR =
    TF_MS_MAP[tf] ||
    3600000;

  // =========================================
  // HEAD
  // =========================================
  if (
    firstMs -
    startMs >
    ONE_BAR
  ) {
    console.log(
      "⚠️ missing head:",
      start,
      "→",
      first.timestamp_utc
    );

    await fetchAndSave_range(
      symbol,
      tf,
      start,
      new Date(
        firstMs - ONE_BAR
      )
        .toISOString()
        .slice(0,10)
    );
  }

  // =========================================
  // TAIL
  // =========================================
  const effectiveEndMs =
    Math.min(
      endMs,
      Date.now()
    );

  if (
    effectiveEndMs -
    lastMs >
    ONE_BAR
  ) {
    console.log(
      "⚠️ missing tail:",
      last.timestamp_utc,
      "→",
      new Date(
        effectiveEndMs
      ).toISOString()
    );

    await fetchAndSave_range(
      symbol,
      tf,
      new Date(
        lastMs + ONE_BAR
      )
        .toISOString()
        .slice(0,10),

      new Date(
        effectiveEndMs
      )
        .toISOString()
        .slice(0,10)
    );
  }

  // =========================================
  // sanitize
  // =========================================
  const sanitizeBars = (
    rows:any[]
  ) => {
    if (!rows?.length)
      return rows;

    rows.sort(
      (a,b)=>
        new Date(
          a.timestamp_utc
        ).getTime() -
        new Date(
          b.timestamp_utc
        ).getTime()
    );

    const result:any[]=[];

    for (
      let i=0;
      i<rows.length;
      i++
    ) {
      const cur =
        rows[i];

      const open =
        Number(cur.open);

      const high =
        Number(cur.high);

      const low =
        Number(cur.low);

      const close =
        Number(cur.close);

      const prev =
        result[
          result.length-1
        ];

      if (!prev) {
        result.push({
          ...cur,
          open,
          high,
          low,
          close,
        });

        continue;
      }

      const prevClose =
        Number(
          prev.close
        );

      const prevHigh =
        Number(
          prev.high
        );

      const prevLow =
        Number(
          prev.low
        );

      const highInvalid =
        !high ||
        Math.abs(
          high -
          prevClose
        ) /
          prevClose >
          0.2;

      const lowInvalid =
        !low ||
        Math.abs(
          low -
          prevClose
        ) /
          prevClose >
          0.2;

      const closeInvalid =
        !close ||
        Math.abs(
          close -
          prevClose
        ) /
          prevClose >
          0.2;

      result.push({
        ...cur,
        open:
          open ||
          prevClose,
        high:
          highInvalid
            ? prevHigh
            : high,
        low:
          lowInvalid
            ? prevLow
            : low,
        close:
          closeInvalid
            ? prevClose
            : close,
      });
    }

    return result;
  };

  // =========================================
  // 再取得
  // =========================================
  let retry = 0;

  while (retry < 5) {
    rows =
      await getChartOHLC(
        symbol,
        tf,
        start,
        end
      );

    console.log(
      "🔁 retry(final)",
      retry,
      rows?.length
    );

    if (rows?.length)
      break;

    await new Promise(r =>
      setTimeout(r,200)
    );

    retry++;
  }

  const cleaned =
    sanitizeBars(rows);

  const series =
    buildChartSeries(
      cleaned
    );

  // =========================================
// weekly pivot
// =========================================
const { data:pivots=[] } =
  await supabase
    .from("pivot_levels")
    .select("*")
    .eq("symbol",symbol)
    .eq("timeframe","weekly");

return series.map(bar=>{
  const d =
    new Date(bar.time);

  const pivot =
    pivots.find(p=>{
      const weekStart =
        new Date(
          p.source_week_start
        );

      const weekEnd =
        new Date(
          weekStart
        );

      weekEnd.setDate(
        weekEnd.getDate()+7
      );

      return (
        d >= weekStart &&
        d < weekEnd
      );
    });

  return {
    ...bar,
    pp:pivot?.pivot ?? null,
    r1:pivot?.r1 ?? null,
    r2:pivot?.r2 ?? null,
    r3:pivot?.r3 ?? null,
    s1:pivot?.s1 ?? null,
    s2:pivot?.s2 ?? null,
    s3:pivot?.s3 ?? null,
  };
});
};