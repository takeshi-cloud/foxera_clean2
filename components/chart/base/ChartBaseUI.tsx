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
        WebkitOverflowScrolling: "touch",
        width: "100%",
      }}
    >
      <div
        style={{
          minWidth: compact ? 500 : 900,
          position: "relative",
        }}
      >
        {children}

        {/* ============================= */}
        {/* 日付レイヤー */}
        {/* ============================= */}

        <div
          style={{
            position: "absolute",
            left: 0,
            top: compact ? 470 : 540,
            width: "100%",
            height: compact ? 16 : 20,
            pointerEvents: "none",
          }}
        >
          {merged.map((d, i) => {
            const date = new Date(d.time);
            const day = date.getDate();

            if (i > 0) {
              const prev = new Date(
                merged[i - 1].time
              );

              if (
                prev.getDate() === day
              ) {
                return null;
              }
            }

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
left: `calc(${
  (i /
    Math.max(
      merged.length - 1,
      1
    )) * 100
}% * 0.94 + 42px)`,
                  transform: "translateX(-50%)",
                  color: "#ccc",
                  fontSize: compact ? 10 : 12,
                  whiteSpace: "nowrap",
                }}
              >
                {day}日
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}