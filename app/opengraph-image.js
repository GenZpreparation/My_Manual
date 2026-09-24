import { ImageResponse } from "next/og";

export const alt = "The Interview Manual — free interview questions & answers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share (WhatsApp/LinkedIn/X) preview: warm white + black
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FAF7F0", color: "#1C1812", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#1C1812", color: "#FAF7F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700 }}>M</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>The Interview Manual</div>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>
          Practice the questions real interviews actually ask.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#6B6455" }}>
          Free · No sign up · Python, Java, SQL &amp; more
        </div>
      </div>
    ),
    size
  );
}
