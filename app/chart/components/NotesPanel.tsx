"use client";

export const NotesPanel = ({ notes, updateNote }) => {
  return (
    <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
      {notes.map((note, i) => (
        <div
          key={i}
          style={{
            width: "25%",
            background: "#333",
            padding: 15,
            borderRadius: 8,
          }}
        >
          <input
            value={note.title}
            onChange={(e) => updateNote(i, "title", e.target.value)}
            style={{
              width: "100%",
              marginBottom: 10,
              fontWeight: "bold",
              background: "transparent",
              color: "white",
              borderBottom: "1px solid #555",
            }}
          />

          <textarea
            value={note.text}
            onChange={(e) => updateNote(i, "text", e.target.value)}
            style={{
              width: "100%",
              height: 260,
              background: "transparent",
              color: "white",
              border: "1px solid #555",
              borderRadius: 4,
              padding: 8,
            }}
          />
        </div>
      ))}
    </div>
  );
};
