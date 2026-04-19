"use client";

type Props = {
  yearFilter: string;
  monthFilter: string;
  symbolFilter: string;
  resultFilter: string;
  directionFilter: string;

  uniqueYears: string[];
  uniqueSymbols: string[];

  onYearChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onSymbolChange: (v: string) => void;
  onResultChange: (v: string) => void;
  onDirectionChange: (
    v: string
  ) => void;
};

export default function TradeJournalFilters({
  yearFilter,
  monthFilter,
  symbolFilter,
  resultFilter,
  directionFilter,

  uniqueYears,
  uniqueSymbols,

  onYearChange,
  onMonthChange,
  onSymbolChange,
  onResultChange,
  onDirectionChange,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        padding: 10,
        border: "1px solid #333",
        borderRadius: 8,
      }}
    >
      <span>フィルター</span>

      <select
        value={yearFilter}
        onChange={(e) =>
          onYearChange(
            e.target.value
          )
        }
      >
        <option value="">年</option>
        {uniqueYears.map((year) => (
          <option
            key={year}
            value={year}
          >
            {year}
          </option>
        ))}
      </select>

      <select
        value={monthFilter}
        onChange={(e) =>
          onMonthChange(
            e.target.value
          )
        }
      >
        <option value="">月</option>
        {Array.from(
          { length: 12 },
          (_, i) => {
            const month = String(
              i + 1
            ).padStart(2, "0");

            return (
              <option
                key={month}
                value={month}
              >
                {month}
              </option>
            );
          }
        )}
      </select>

      <select
        value={symbolFilter}
        onChange={(e) =>
          onSymbolChange(
            e.target.value
          )
        }
      >
        <option value="">ペア</option>
        {uniqueSymbols.map((s) => (
          <option
            key={s}
            value={s}
          >
            {s}
          </option>
        ))}
      </select>

      <select
        value={resultFilter}
        onChange={(e) =>
          onResultChange(
            e.target.value
          )
        }
      >
        <option value="">結果</option>
        <option value="WIN">
          WIN
        </option>
        <option value="LOSS">
          LOSS
        </option>
        <option value="EVEN">
          EVEN
        </option>
      </select>

      <select
        value={directionFilter}
        onChange={(e) =>
          onDirectionChange(
            e.target.value
          )
        }
      >
        <option value="">方向</option>
        <option value="LONG">
          LONG
        </option>
        <option value="SHORT">
          SHORT
        </option>
      </select>
    </div>
  );
}