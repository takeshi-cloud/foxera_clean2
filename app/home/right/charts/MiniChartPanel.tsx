"use client";

export const MiniChartPanel = ({
  title,
}: {
  title: string;
}) => {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 12,
        background: "#0f172a",
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.6,
      }}
    >
      {title}
    </div>
  );
};