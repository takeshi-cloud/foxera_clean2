type Props = {
  journalId: string | null;
  onSave: () => void;
  onClear: () => void;
};

export default function JournalHeaderActions({
  journalId,
  onSave,
  onClear,
}: Props) {
  return (
    <div style={container}>
      <button
        onClick={onSave}
        style={primaryBtn}
        onMouseEnter={(e) =>
          (e.currentTarget.style.opacity = "0.85")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.opacity = "1")
        }
      >
        {journalId ? "更新" : "保存"}
      </button>

      {journalId && (
        <button
          onClick={onClear}
          style={dangerBtn}
          onMouseEnter={(e) =>
            (e.currentTarget.style.opacity = "0.85")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.opacity = "1")
          }
        >
          削除
        </button>
      )}

      <button
        onClick={() =>
          (window.location.href = "/trade-journal")
        }
        style={secondaryBtn}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#334155")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "#1e293b")
        }
      >
        トレード記録一覧
      </button>
    </div>
  );
}

// =======================
// style
// =======================

const container: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginBottom: "5px",
};

// 🔵 メイン（保存・更新）
const primaryBtn: React.CSSProperties = {
  padding: "3px 16px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.15s ease",
};

// 🔴 削除
const dangerBtn: React.CSSProperties = {
  padding: "3px 16px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  transition: "all 0.15s ease",
};

// ⚪ サブ（一覧）
const secondaryBtn: React.CSSProperties = {
  padding: "3px 16px",
  background: "#098f1b",
  color: "#dff5cb",
  border: "1px solid #334155",
  borderRadius: "10px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s ease",
};