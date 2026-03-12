import type { Camera, Snowflake } from "../types";
import { WORLD_H } from "../types";

export function drawSnowParticles(
  ctx: CanvasRenderingContext2D,
  flakes: Snowflake[],
  cw: number,
  ch: number
) {
  for (const f of flakes) {
    ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
    ctx.beginPath();
    ctx.arc(f.x * cw, f.y * ch, f.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawWeatherOverlay(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number
) {
  const progress = Math.max(0, cam.y / WORLD_H);

  if (progress > 0.3) {
    const hazeAlpha = Math.min(0.1, (progress - 0.3) * 0.15);
    ctx.fillStyle = `rgba(190, 208, 228, ${hazeAlpha})`;
    ctx.fillRect(0, 0, cw, ch);
  }

  if (progress > 0.5) {
    const fogAlpha = Math.min(0.07, (progress - 0.5) * 0.1);
    const t = Date.now() / 4000;
    for (let i = 0; i < 5; i++) {
      const x = (Math.sin(t + i * 1.3) * 0.5 + 0.5) * cw;
      const y = ch * (0.2 + i * 0.16);
      const w = 180 + i * 70;
      ctx.fillStyle = `rgba(200, 215, 232, ${fogAlpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, w, 25 + i * 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
