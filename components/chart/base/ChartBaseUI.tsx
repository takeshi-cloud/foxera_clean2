"use client";

type Props = {
  merged?: any[];

  children: React.ReactNode;

  compact?: boolean;
};

export default function ChartBaseUI({
  merged = [],
  children,
  compact = false,
}: Props) {
  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling:
          "touch",
        width: "100%",
      }}
    >
      <div
        style={{
          minWidth: compact
            ? 500
            : 900,
        }}
      >
        {children}

        {/* ============================= */}
        {/* 日付レイヤー */}
        {/* ============================= */}

        <div
          style={{
            position:
              "relative",
            width: "100%",
            height: compact
              ? 14
              : 20,
            marginTop: compact
              ? -10
              : -15,
          }}
        >
          {merged.map(
            (d, i) => {
              const date =
                new Date(
                  d.time
                );

              const day =
                date.getDate();

              if (i > 0) {
                const prev =
                  new Date(
                    merged[
                      i - 1
                    ].time
                  );

                if (
                  prev.getDate() ===
                  day
                )
                  return null;
              }

              return (
                <div
                  key={i}
                  style={{
                    position:
                      "absolute",
                    left: `${
                      (i /
                        Math.max(
                          merged.length,
                          1
                        )) *
                      100
                    }%`,
                    transform:
                      "translateX(-50%)",
                    color:
                      "#ccc",
                    fontSize:
                      compact
                        ? 10
                        : 12,
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {day}日
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}