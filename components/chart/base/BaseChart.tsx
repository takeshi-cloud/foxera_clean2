"use client";

import ChartBaseUI from "./ChartBaseUI";
import ChartRender from "./ChartRender";

type Props = {
  merged?: any[];
  fibData?: any;
  zigzagData?: any[];
  selectedZigzagIndex?: number;
  setSelectedZigzagIndex?: (v: number) => void;
  showLine: boolean;
  showZigzag: boolean;
  showFib: boolean;
  showPivot: boolean;
  dowLines: any[];
  compact?: boolean;
  width?: number;
  height?: number;
};

const headers = ["#", "idx", "time", "price", "type", "START", "END"];

export default function BaseChart({
  merged = [],
  fibData,
  zigzagData = [],
  selectedZigzagIndex,
  setSelectedZigzagIndex,
  showLine,
  showZigzag,
  showFib,
  showPivot,
  dowLines,
  compact = false,
  width = 1200,
  height = 600,
}: Props) {
  const size = Math.ceil(zigzagData.length / 3);
  const left = zigzagData.slice(0, size);
  const center = zigzagData.slice(size, size * 2);
  const right = zigzagData.slice(size * 2);

  const renderRow = (z: any, i: number) => {
    if (!z) {
      return Array.from({ length: 7 }).map((_, idx) => (
        <td key={idx} style={tdStyle} />
      ));
    }

    const dowBreak = dowLines.find((x) => x.fromIndex === i);
    const dowEnd = dowLines.find((x) => x.endIndex === i);

    const prevSameType = [...zigzagData]
      .slice(0, i)
      .reverse()
      .find((x) => x.type === z.type);

    const typeColor =
      !prevSameType
        ? "#999"
        : z.price > prevSameType.price
        ? "#00ff66"
        : "#ff4444";

    return (
      <>
        <td style={tdStyle}>{i}</td>
        <td style={tdStyle}>{z.idx}</td>

        <td style={tdStyle}>
          {z.time?.replace("T", " ").replace("+00:00", "")}
        </td>

        <td style={tdStyle}>{z.price?.toFixed(5)}</td>

        <td style={{ ...tdStyle, color: typeColor, fontWeight: 700 }}>
          {z.type}
        </td>

        <td
          style={{
            ...tdStyle,
            color:
              dowBreak?.type === "trendBreakUp"
                ? "#00ff66"
                : "#ff4444",
            fontWeight: 700,
          }}
        >
          {dowBreak
            ? `${dowBreak.type === "trendBreakUp" ? "UP" : "DOWN"} #${dowBreak.id}`
            : ""}
        </td>

        <td
          style={{
            ...tdStyle,
            color:
              dowEnd?.type === "trendBreakUp"
                ? "#00ff66"
                : "#ff4444",
            fontWeight: 700,
          }}
        >
          {dowEnd
            ? `${dowEnd.type === "trendBreakUp" ? "UP END" : "DOWN END"} #${dowEnd.id}`
            : ""}
        </td>
      </>
    );
  };

  return (
    <ChartBaseUI merged={merged} compact={compact}>
      <ChartRender
        merged={merged}
        fibData={fibData}
        zigzagData={zigzagData}
        selectedZigzagIndex={selectedZigzagIndex}
        setSelectedZigzagIndex={setSelectedZigzagIndex}
        showLine={showLine}
        showZigzag={showZigzag}
        showFib={showFib}
        showPivot={showPivot}
        dowLines={dowLines}
        width={width}
        height={height}
      />

      {showZigzag && zigzagData.length > 0 && (
        <div
          style={{
            marginTop: 4,
            color: "white",
            fontSize: 11,
            overflowX: "auto",
            padding: "0 4px",
          }}
        >
          <div style={{ marginBottom: 2 }}>
            ZigZag ({zigzagData.length})
          </div>

          <table
            style={{
              borderCollapse: "collapse",
              width: "max-content",
              whiteSpace: "nowrap",
            }}
          >
            <thead>
              <tr>
                <th colSpan={7} style={groupStyle}>
                  LEFT
                </th>

                <th colSpan={7} style={groupStyle}>
                  CENTER
                </th>

                <th colSpan={7} style={groupStyle}>
                  RIGHT
                </th>
              </tr>

              <tr>
                {headers.map((x) => (
                  <th key={`l-${x}`} style={thStyle}>
                    {x}
                  </th>
                ))}

                {headers.map((x) => (
                  <th key={`c-${x}`} style={thStyle}>
                    {x}
                  </th>
                ))}

                {headers.map((x) => (
                  <th key={`r-${x}`} style={thStyle}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {left.map((leftZ, rowIdx) => (
                <tr key={rowIdx}>
                  {renderRow(leftZ, rowIdx)}
                  {renderRow(center[rowIdx], rowIdx + size)}
                  {renderRow(right[rowIdx], rowIdx + size * 2)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartBaseUI>
  );
}

const groupStyle = {
  border: "1px solid #444",
  background: "#111",
  color: "#999",
  padding: "1px 2px",
  textAlign: "center" as const,
};

const thStyle = {
  border: "1px solid #333",
  padding: "1px 3px",
  textAlign: "left" as const,
  background: "#111",
  lineHeight: 1.15,
  fontSize: 14,
};

const tdStyle = {
  border: "1px solid #222",
  padding: "1px 3px",
  lineHeight: 1.15,
  fontSize: 14,
};