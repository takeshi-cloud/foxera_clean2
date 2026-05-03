import { getPhaseColor, COLS, formatPhase } from "./utils";

export const Row = ({ card, activePair, setActivePair }: any) => {
 console.log("ROW CARD", card); // ←これ入れる

  const normalize = (pair: string) =>
    pair?.replace("/", "").toUpperCase();

  const isActive =
    normalize(activePair) === normalize(card.pair);

  // =============================
  // 🔥 HTF / LTF を直接使う
  // =============================
  const htf = card.HTF;
  const ltf = card.LTF;

  // =============================
  // 🔥 L / S バッジ
  // =============================
  const DirBadge = (dir: string | null | undefined) => {
    if (!dir) {
      return <span style={{ opacity: 0.3 }}>-</span>;
    }

    const isLong = dir === "long";

    return (
      <div
        style={{
          width: "18px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13px",
          borderRadius: "4px",
          background: isLong ? "#16a34a" : "#dc2626",
          color: "white"
        }}
      >
        {isLong ? "L" : "S"}
      </div>
    );
  };

  // =============================
  // 🔥 Phaseアイコン（明確IF）
  // =============================
const getMAIcon = (direction, phase) => {
  if (!direction) return null;

  const dir = direction.toUpperCase();

  // 🔥 OTHERも表示する
  const isUp = dir === "UP";
  const isDown = dir === "DOWN";

  let dirIcon = "•"; // ← OTHER用
  let color = "#888";

  if (isUp) {
    dirIcon = "⤴";
    color = "#00ff40";
  } else if (isDown) {
    dirIcon = "⤵";
    color = "#ff0000";
  }

  let phaseIcon = "";

  if (phase) {
    const ph = phase.toUpperCase();

    if (ph === "TREND") phaseIcon = "🚀";
    if (ph === "PULLBACK") phaseIcon = "↩️";
    if (ph === "TRIGGER") phaseIcon = "⚡";
    if (ph === "REVERSAL") phaseIcon = "🔀";
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={{ color, fontWeight: "bold", marginRight: "2px" }}>
        {dirIcon}
      </span>
      <span>{phaseIcon}</span>
    </span>
  );
};
  // =============================
  // 🔥 Pivot
  // =============================
  const getPivotLabel = (y: number | null | undefined) => {
    if (y == null) return "-";

    const levels = [3, 2, 1, 0, -1, -2, -3];
    const names = ["R3", "R2", "R1", "PP", "S1", "S2", "S3"];

    let min = Infinity;
    let idx = 0;

    levels.forEach((v, i) => {
      const d = Math.abs(y - v);
      if (d < min) {
        min = d;
        idx = i;
      }
    });

    

    return names[idx];
  };

  return (
    <div
      onClick={() => setActivePair(card.pair)}
      style={{
        display: "grid",
        gridTemplateColumns: COLS,
        gap: "4px",
        background: "#020617",
        padding: "4px 6px",
        borderRadius: "6px",
        marginBottom: "4px",
        fontSize: "13px",
        alignItems: "center",
        border: isActive
          ? "2px solid #ff4d6d"
          : "1px solid #1e293b",
        boxShadow: isActive
          ? "0 0 0 3px #ff00cc, 0 0 10px #ff00cc, 0 0 40px #ff4d6d"
          : "none",
        transform: isActive ? "scale(1.02)" : "scale(1)",
        zIndex: isActive ? 10 : 1,
        cursor: "pointer",
        transition: "all 0.15s ease"
      }}
    >

      {/* Pair */}
      <div style={{ fontWeight: "bold", fontSize: "14px" }}>
        {card.pair}
      </div>

      {/* Dir①（HTF） */}
      <div style={{ textAlign: "center" }}>
        {DirBadge(htf?.direction)}
      </div>

      {/* Dir②（LTF） */}
      <div style={{ textAlign: "center" }}>
        {DirBadge(ltf?.direction)}
      </div>

      {/* Phase①（HTF） */}
      <div
        style={{
          background: getPhaseColor(htf?.phase),
          padding: "2px 0px",
          borderRadius: "4px",
          fontSize: "11px",
          textAlign: "center",
          fontWeight: "bold",
          minWidth: "20px"
        }}
      >
        {htf?.phase ? formatPhase(htf.phase) : "-"}
      </div>

      {/* Phase②（LTF） */}
      <div
        style={{
          background: ltf?.phase ? getPhaseColor(ltf.phase) : "#333",
          padding: "2px 2px",
          borderRadius: "4px",
          fontSize: "11px",
          textAlign: "center",
          fontWeight: "bold",
          minWidth: "20px"
        }}
      >
        {ltf?.phase ? formatPhase(ltf.phase) : "-"}
      </div>

      {/* Pivot（HTF基準でOK） */}
      <div style={{ textAlign: "center" }}>
        {getPivotLabel(card.pivotY)}
      </div>

      {/* MA状態（HTF基準） */}
      <div style={{ textAlign: "center" }}>
     {getMAIcon(card.maDirection, card.maPhase)}
      </div>



    </div>
  );
};