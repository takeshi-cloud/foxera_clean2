"use client";

type Props = {
  tradeInfo: any;
  setTradeInfo: (value: any) => void;
};

export const TradeResultPanel = ({
  tradeInfo,
  setTradeInfo,
}: Props) => {
  const readonlyStyle = {
    width: "100%",
    background: "#222",
    color: "#aaa",
    border: "1px solid #555",
    padding: 6,
  };

  const inputStyle = {
    width: "100%",
    padding: 6,
  };

  const rowStyle = {
    display: "flex",
    gap: 8,
    marginBottom: 10,
  };

  const halfStyle = {
    flex: 1,
  };

  return (
    <div
      style={{
        width: 300,
        background: "#333",
        padding: 15,
        borderRadius: 8,
        height: "fit-content",
      }}
    >
      <h3>トレード結果</h3>

      {/* シンボル / 保有時間 */}
      <label>シンボル / 保有時間</label>
      <div style={rowStyle}>
        <input
          value={tradeInfo.symbol ?? ""}
          readOnly
          style={{
            ...readonlyStyle,
            ...halfStyle,
          }}
        />

        <input
          value={
            tradeInfo.holdingTime ??
            ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              holdingTime:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />
      </div>

      {/* エントリー日時 */}
      <label>エントリー日時</label>
      <div style={rowStyle}>
        <input
          type="date"
          value={
            tradeInfo.entryDate ??
            ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              entryDate:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />

        <input
          type="time"
          value={
            tradeInfo.entryTime ??
            ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              entryTime:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />
      </div>

      {/* EXIT日時 */}
      <label>EXIT日時</label>
      <div style={rowStyle}>
        <input
          type="date"
          value={
            tradeInfo.exitDate ??
            ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              exitDate:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />

        <input
          type="time"
          value={
            tradeInfo.exitTime ??
            ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              exitTime:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />
      </div>

      {/* ペア */}
      <label>ペア</label>
      <input
        value={
          tradeInfo.pair ?? ""
        }
        onChange={(e) =>
          setTradeInfo({
            ...tradeInfo,
            pair: e.target.value,
          })
        }
        style={{
          ...inputStyle,
          marginBottom: 10,
        }}
      />

      {/* 方向 / 結果 */}
      <label>方向 / 結果</label>
      <div style={rowStyle}>
        <select
          value={
            tradeInfo.direction
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              direction:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        >
          <option value="LONG">
            LONG
          </option>
          <option value="SHORT">
            SHORT
          </option>
        </select>

        <select
          value={
            tradeInfo.result
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              result:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        >
          <option value="">
            選択
          </option>
          <option value="WIN">
            勝ち
          </option>
          <option value="EVEN">
            引分
          </option>
          <option value="LOSS">
            負け
          </option>
        </select>
      </div>

      {/* Size / Pips */}
      <label>Size / Pips</label>
      <div style={rowStyle}>
        <input
          value={
            tradeInfo.size ?? ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              size:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />

        <input
          value={
            tradeInfo.pips ?? ""
          }
          onChange={(e) =>
            setTradeInfo({
              ...tradeInfo,
              pips:
                e.target.value,
            })
          }
          style={{
            ...inputStyle,
            ...halfStyle,
          }}
        />
      </div>

      {/* Profit */}
      <label>Profit(円)</label>
      <input
        type="number"
        value={
          tradeInfo.profit ??
          ""
        }
        onChange={(e) =>
          setTradeInfo({
            ...tradeInfo,
            profit:
              e.target.value,
          })
        }
        style={inputStyle}
      />
    </div>
  );
};