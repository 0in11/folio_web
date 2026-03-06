import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Jin YoungIn | AI Engineer Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0A0A0F",
          color: "#F1F5F9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Jin YoungIn
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#60A5FA",
              fontWeight: 500,
            }}
          >
            AI Engineer
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#A8B3C7",
              marginTop: "8px",
            }}
          >
            RAG · Agents · LLMOps · Domain-specific AI
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
