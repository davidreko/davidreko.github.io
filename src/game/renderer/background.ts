import type { Camera } from "../types";
import { hash } from "./common";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, "#4a90d9");
  grad.addColorStop(0.2, "#7bb8e8");
  grad.addColorStop(0.4, "#a8d4f0");
  grad.addColorStop(0.6, "#d0e8f5");
  grad.addColorStop(1, "#dce6ee");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  const parallax = cam.y * 0.012;

  // Far range
  ctx.fillStyle = "#8ea5be";
  ctx.beginPath();
  ctx.moveTo(-20, ch);
  for (let x = -20; x <= cw + 20; x += 40) {
    const p =
      Math.sin(x * 0.003 + 0.7) * 70 +
      Math.cos(x * 0.006 + 2.1) * 35 +
      Math.sin(x * 0.0015) * 40;
    ctx.lineTo(x, ch * 0.3 - p - parallax);
  }
  ctx.lineTo(cw + 20, ch);
  ctx.closePath();
  ctx.fill();

  // Snow highlights on far peaks
  ctx.fillStyle = "rgba(220, 235, 250, 0.3)";
  ctx.beginPath();
  ctx.moveTo(-20, ch);
  for (let x = -20; x <= cw + 20; x += 40) {
    const p =
      Math.sin(x * 0.003 + 0.7) * 70 +
      Math.cos(x * 0.006 + 2.1) * 35 +
      Math.sin(x * 0.0015) * 40;
    ctx.lineTo(x, ch * 0.3 - p - parallax + 15);
  }
  ctx.lineTo(cw + 20, ch);
  ctx.closePath();
  ctx.fill();

  // Mid range
  ctx.fillStyle = "#a0b5ca";
  ctx.beginPath();
  ctx.moveTo(-20, ch);
  for (let x = -20; x <= cw + 20; x += 35) {
    const p =
      Math.sin(x * 0.005 + 3) * 45 + Math.cos(x * 0.003 + 1) * 30;
    ctx.lineTo(x, ch * 0.38 - p - parallax * 0.6);
  }
  ctx.lineTo(cw + 20, ch);
  ctx.closePath();
  ctx.fill();

  // Near foothills
  ctx.fillStyle = "#b8cad8";
  ctx.beginPath();
  ctx.moveTo(-20, ch);
  for (let x = -20; x <= cw + 20; x += 30) {
    const p = Math.sin(x * 0.007 + 5) * 25 + Math.cos(x * 0.004) * 18;
    ctx.lineTo(x, ch * 0.45 - p - parallax * 0.3);
  }
  ctx.lineTo(cw + 20, ch);
  ctx.closePath();
  ctx.fill();
}

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number
) {
  const snowGrad = ctx.createLinearGradient(0, 0, cw, ch);
  snowGrad.addColorStop(0, "#dce6ee");
  snowGrad.addColorStop(0.3, "#e2eaf2");
  snowGrad.addColorStop(0.7, "#d8e2ec");
  snowGrad.addColorStop(1, "#d0dae6");
  ctx.fillStyle = snowGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Wind-blown snow texture
  ctx.strokeStyle = "rgba(200, 218, 235, 0.25)";
  ctx.lineWidth = 1;
  const windSpacing = 28;
  const worldYTop = cam.y - ch / 3 - 30;
  const startY = Math.floor(worldYTop / windSpacing) * windSpacing;
  for (let wy = startY; wy < worldYTop + ch + 60; wy += windSpacing) {
    const sy = wy - cam.y + ch / 3;
    if (sy < -10 || sy > ch + 10) continue;
    ctx.beginPath();
    for (let sx = -20; sx <= cw + 20; sx += 8) {
      const worldX = sx + cam.x - cw / 2;
      const wave = Math.sin(worldX * 0.008 + wy * 0.003) * 3;
      if (sx === -20) ctx.moveTo(sx, sy + wave);
      else ctx.lineTo(sx, sy + wave);
    }
    ctx.stroke();
  }

  // Sastrugi / snow drift shadows
  ctx.fillStyle = "rgba(160, 185, 210, 0.08)";
  const driftSpacing = 120;
  const driftStartY = Math.floor(worldYTop / driftSpacing) * driftSpacing;
  for (let wy = driftStartY; wy < worldYTop + ch + 150; wy += driftSpacing) {
    const h2 = hash(1, Math.floor(wy / driftSpacing));
    const sy = wy - cam.y + ch / 3;
    const wx = h2 * 1800 - cam.x + cw / 2;
    const dw = 60 + h2 * 100;
    ctx.beginPath();
    ctx.ellipse(wx, sy, dw, 8 + h2 * 6, 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sun/light direction shading
  const lightGrad = ctx.createLinearGradient(0, 0, cw, ch);
  lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  lightGrad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
  lightGrad.addColorStop(1, "rgba(0, 20, 50, 0.04)");
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, cw, ch);
}
