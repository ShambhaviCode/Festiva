import type { GlobeOptions } from "./scene";

/**
 * Static 2D rendering of the same globe for devices without WebGL.
 * Draws one orthographic frame onto a 2D canvas: no animation loop at all.
 */
export function mountFallbackGlobe(container: HTMLElement, options: Pick<GlobeOptions, "points" | "markers">): () => void {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const rotY = (78 * Math.PI) / 180; // centre longitude
  const tilt = (18 * Math.PI) / 180;

  const project = (lat: number, lon: number): { x: number; y: number; z: number } => {
    const phi = (lat * Math.PI) / 180;
    const lambda = (lon * Math.PI) / 180 - rotY;
    const x = Math.cos(phi) * Math.sin(lambda);
    const y0 = Math.sin(phi);
    const z0 = Math.cos(phi) * Math.cos(lambda);
    return { x, y: y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z: y0 * Math.sin(tilt) + z0 * Math.cos(tilt) };
  };

  const draw = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width, height) * 0.4;
    const cx = width / 2;
    const cy = height / 2;
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.25);
    glow.addColorStop(0, "rgba(199,122,42,0.35)");
    glow.addColorStop(1, "rgba(199,122,42,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#24102a";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dcc898";
    for (let i = 0; i < options.points.length; i += 2) {
      const p = project(options.points[i] / 10, options.points[i + 1] / 10);
      if (p.z <= 0) continue;
      ctx.globalAlpha = 0.3 + 0.6 * p.z;
      ctx.beginPath();
      ctx.arc(cx + p.x * radius, cy - p.y * radius, Math.max(0.8, radius * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f0a030";
    for (const marker of options.markers) {
      const p = project(marker.lat, marker.lon);
      if (p.z <= 0) continue;
      ctx.beginPath();
      ctx.arc(cx + p.x * radius, cy - p.y * radius, Math.max(2.5, radius * 0.016), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const observer = new ResizeObserver(draw);
  observer.observe(container);
  draw();
  return () => {
    observer.disconnect();
    canvas.remove();
  };
}
