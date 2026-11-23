import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The same eight-petal rosette as the header logo (components/Logo.tsx). */
const PETALS = ["#ff9f1c", "#e5157a", "#19c39a", "#12b5c4", "#ffc23d", "#ff6b4a", "#8b5cf6", "#00866b"];

/** Social preview image, generated at build time. Uses the default bundled font so no network is needed. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#170833", color: "#fffaf2", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="76" height="76" viewBox="0 0 40 40">
            {PETALS.map((c, i) => (
              <ellipse key={c} cx="20" cy="9.5" rx="5.2" ry="9" fill={c} transform={`rotate(${i * 45} 20 20)`} opacity="0.95" />
            ))}
            <circle cx="20" cy="20" r="5.4" fill="#fffaf2" />
            <circle cx="20" cy="20" r="2.4" fill="#170833" />
          </svg>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -2, color: "#fffaf2" }}>festiva</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05 }}>Discover the world.</div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, color: "#ffc23d" }}>Celebrate every culture.</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28, color: "#ff9f1c" }}>{site.supporting}</div>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%", background: "linear-gradient(90deg, #ff9f1c, #d4106f, #12b5c4, #19c39a, #ffc23d)" }} />
      </div>
    ),
    size,
  );
}
