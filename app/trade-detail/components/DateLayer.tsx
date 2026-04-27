export function DateLayer({ merged }) {
  return (
    <div style={{ position: "relative", width: 1400, height: 20, marginTop: -15 }}>
      {merged.map((d, i) => {
        const date = new Date(d.time);
        const day = date.getDate();

        if (i > 0) {
          const prev = new Date(merged[i - 1].time);
          if (prev.getDate() === day) return null;
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i / merged.length) * 100}%`,
              transform: "translateX(-50%)",
              color: "#ccc",
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {day}日
          </div>
        );
      })}
    </div>
  );
}
