// 👉 プレビュー表示に必要な最低限のprops
type Props = {
  selectedIndex: number; // 👉 選択中の行index
  filtered: any[];       // 👉 表示中データ（フィルター後）
  forms: any;            // 👉 編集状態（image_urlもここ）
};

export default function PreviewPanel({ selectedIndex, filtered, forms }: Props) {

  // 👉 現在選択されているデータ
  const selected = filtered[selectedIndex];

  return (
    <div
      style={{
        width: "260px",
        height: "160px",
        marginLeft: "12px",
        border: "1px solid #1e293b",
        borderRadius: "6px",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {selected ? (
        <img
          // 👉 表示はforms優先（編集中の内容を反映）
          src={forms[selected.id]?.image_url}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <div style={{ opacity: 0.5, fontSize: "12px" }}>
          選択してください
        </div>
      )}
    </div>
  );
}