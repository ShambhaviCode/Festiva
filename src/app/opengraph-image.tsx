import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview image, generated at build time. Uses the default bundled font so no network is needed. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1e0a23", color: "#fbf6ea", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 14, color: "#dcc898" }}>FESTIVA</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05 }}>Discover the world.</div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05 }}>Celebrate every culture.</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28, color: "#f0a030" }}>{site.supporting}</div>
        </div>
      </div>
    ),
    size,
  );
}
