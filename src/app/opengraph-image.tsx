import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "David Reko - Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a1628",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mountain silhouettes */}
        <svg
          viewBox="0 0 1200 630"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <polygon
            points="0,630 150,350 350,460 600,120 850,460 1050,350 1200,630"
            fill="rgba(255,255,255,0.03)"
          />
          <polygon
            points="0,630 360,290 660,420 900,230 1200,630"
            fill="rgba(255,255,255,0.02)"
          />
        </svg>

        {/* Snow dots */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${2 + (i % 3) * 1.5}px`,
              height: `${2 + (i % 3) * 1.5}px`,
              borderRadius: "50%",
              backgroundColor: `rgba(255,255,255,${0.15 + (i % 4) * 0.08})`,
              top: `${(i * 73 + 17) % 100}%`,
              left: `${(i * 47 + 31) % 100}%`,
            }}
          />
        ))}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
              marginBottom: 8,
            }}
          >
            David Reko
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5ba0e0",
              fontWeight: 500,
              marginBottom: 40,
            }}
          >
            Software Engineer - Generative AI
          </div>
          <div
            style={{
              width: 80,
              height: 2,
              backgroundColor: "rgba(255,255,255,0.15)",
              marginBottom: 40,
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#8a9fb8",
              textAlign: "center",
            }}
          >
            Ski the mountain to explore my portfolio
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
