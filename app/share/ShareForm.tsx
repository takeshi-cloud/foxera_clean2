"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { saveSharedScreenshot } from "./shareActions";

import {
  DIRECTIONS,
  TIMEFRAMES,
  PHASES,
} from "@/lib/constants/LogOptions";

const PAIRS = [
  "XAUUSD",
  "USDJPY",
  "GBPJPY",
  "EURJPY",
  "GBPUSD",
  "EURUSD",
  "USDCHF",
  "USDCAD",
  "GBPAUD",
  "EURAUD",
  "AUDJPY",
  "AUDUSD",
  "EURGBP",
  "NASDAQ",
];

export default function ShareForm() {
  const params = useSearchParams();

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  // ===================================
  // state
  // ===================================
  const [selected, setSelected] =
    useState<string | null>(null);

  const [date, setDate] =
    useState(today);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [showDetail, setShowDetail] =
    useState(false);

  const [direction, setDirection] =
    useState<string | null>(null);

  const [timeframe, setTimeframe] =
    useState<string | null>(null);

  const [phase, setPhase] =
    useState<string | null>(null);

  // ===================================
  // share画像復元
  // ===================================
  useEffect(() => {
    const img =
      params.get("img");

    if (!img) return;

    setPreviewUrl(img);

    (async () => {
      try {
        const res =
          await fetch(img);

        const blob =
          await res.blob();

        const f =
          new File(
            [blob],
            "share.png",
            {
              type: blob.type,
            }
          );

        setFile(f);
      } catch (e) {
        console.error(
          "❌ file復元失敗",
          e
        );
      }
    })();
  }, [params]);

  // ===================================
  // Ctrl+V
  // ===================================
  const handlePasteFile = (
    file: File
  ) => {
    setFile(file);

    const url =
      URL.createObjectURL(file);

    setPreviewUrl(url);
  };

  useEffect(() => {
    const handlePaste = (
      e: ClipboardEvent
    ) => {
      const items =
        e.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (
          item.type.startsWith(
            "image"
          )
        ) {
          const file =
            item.getAsFile();

          if (file) {
            handlePasteFile(
              file
            );
            return;
          }
        }
      }
    };

    window.addEventListener(
      "paste",
      handlePaste
    );

    return () =>
      window.removeEventListener(
        "paste",
        handlePaste
      );
  }, []);

  // ===================================
  // 保存
  // ===================================
  const handleSave =
    async () => {
      if (!selected || !file)
        return;

      try {
        setLoading(true);

        await saveSharedScreenshot({
          file,
          pair: selected,
          date,

          direction,
          timeframe,
          phase,
        });

        window.location.href =
          "/";
      } catch (e) {
        console.error(
          "❌ 保存エラー",
          e
        );
      } finally {
        setLoading(false);
      }
    };

  const handleCancel = () => {
    window.location.href =
      "/";
  };

  const tfButtons =
    TIMEFRAMES.filter((t) =>
      ["1D", "4H", "1H", "15M"]
        .includes(t)
    );

  const phaseButtons =
    PHASES.filter(
      (p) => p !== "Wait"
    );

  return (
        <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 16,
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 上段 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            style={{
              flex: 1,
              padding: 8,
              background: "#222",
              color: "white",
              border:
                "1px solid #555",
            }}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={
              !selected || !file
            }
            style={{
              padding:
                "8px 12px",
              background:
                selected && file
                  ? "#ff00cc"
                  : "#444",
              border: "none",
              color: "white",
              cursor:
                selected && file
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            保存
          </button>

          <button
            type="button"
            onClick={
              handleCancel
            }
            style={{
              padding:
                "8px 12px",
              background:
                "#333",
              border: "none",
              color: "white",
            }}
          >
            中止
          </button>
        </div>

        {/* pair */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {PAIRS.map((p) => {
            const active =
              selected === p;

            return (
              <div
                key={p}
                onClick={() =>
                  setSelected(
                    p
                  )
                }
                style={{
                  padding:
                    "10px 6px",
                  textAlign:
                    "center",
                  cursor:
                    "pointer",
                  border:
                    active
                      ? "1px solid #ff00cc"
                      : "1px solid #555",
                  background:
                    active
                      ? "#ff00cc"
                      : "#222",
                  fontWeight:
                    600,
                  fontSize: 13,
                }}
              >
                {active &&
                  "✔ "}
                {p}
              </div>
            );
          })}
        </div>

        {/* 詳細入力 */}
        <div
          onClick={() =>
            setShowDetail(
              (
                prev
              ) => !prev
            )
          }
          style={{
            marginBottom: 10,
            cursor: "pointer",
            color: "#bbb",
            fontSize: 13,
          }}
        >
          {showDetail
            ? "▲ 詳細入力"
            : "▼ 詳細入力"}
        </div>

        {showDetail && (
          <div
            style={{
              marginBottom: 14,
              border:
                "1px solid #333",
              background:
                "#1a1a1a",
              borderRadius: 6,
              padding: 10,
            }}
          >
            {/* direction */}
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  marginBottom: 6,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Direction
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                {DIRECTIONS.map(
                  (d) => {
                    const active =
                      direction ===
                      d;

                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          setDirection(
                            d
                          )
                        }
                        style={{
                          flex: 1,
                          padding:
                            "8px 0",
                          border:
                            active
                              ? "1px solid #ff00cc"
                              : "1px solid #555",
                          background:
                            active
                              ? "#ff00cc"
                              : "#222",
                          color:
                            "white",
                        }}
                      >
                        {d.toUpperCase()}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* timeframe */}
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  marginBottom: 6,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Timeframe
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, 1fr)",
                  gap: 6,
                }}
              >
                {tfButtons.map(
                  (tf) => {
                    const active =
                      timeframe ===
                      tf;

                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() =>
                          setTimeframe(
                            tf
                          )
                        }
                        style={{
                          padding:
                            "8px 0",
                          border:
                            active
                              ? "1px solid #ff00cc"
                              : "1px solid #555",
                          background:
                            active
                              ? "#ff00cc"
                              : "#222",
                          color:
                            "white",
                        }}
                      >
                        {tf}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* phase */}
            <div>
              <div
                style={{
                  marginBottom: 6,
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                Phase
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: 6,
                }}
              >
                {phaseButtons.map(
                  (p) => {
                    const active =
                      phase === p;

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setPhase(
                            p
                          )
                        }
                        style={{
                          padding:
                            "8px 0",
                          border:
                            active
                              ? "1px solid #ff00cc"
                              : "1px solid #555",
                          background:
                            active
                              ? "#ff00cc"
                              : "#222",
                          color:
                            "white",
                        }}
                      >
                        {p}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* paste */}
        <div
          style={{
            marginTop: 4,
            marginBottom: 10,
            padding: "14px",
            border:
              "1px dashed #555",
            borderRadius: 6,
            textAlign:
              "center",
            color: "#888",
            fontSize: 13,
          }}
        >
          📋 Ctrl+V /
          長押しペースト
        </div>

        {/* preview */}
        <div
          style={{
            flex: 1,
            border:
              "1px solid #333",
            background: "#000",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            position:
              "relative",
            minHeight: 350,
          }}
        >
          {previewUrl ? (
            <>
              <div
                onClick={() => {
                  setPreviewUrl(
                    null
                  );
                  setFile(
                    null
                  );
                }}
                style={{
                  position:
                    "absolute",
                  top: 6,
                  right: 6,
                  background:
                    "rgba(0,0,0,0.6)",
                  padding:
                    "2px 6px",
                  cursor:
                    "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </div>

              <img
                src={
                  previewUrl
                }
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  objectFit:
                    "contain",
                }}
              />
            </>
          ) : (
            <span
              style={{
                opacity: 0.4,
              }}
            >
              プレビュー
              （Ctrl+V /
              Share）
            </span>
          )}
        </div>

        {loading && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
            }}
          >
            保存中...
          </div>
        )}
      </div>
    </div>
  );
}