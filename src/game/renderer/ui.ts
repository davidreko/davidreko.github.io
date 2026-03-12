import type { Vec2, SkierState, Zone, Camera } from "../types";
import { WORLD_H } from "../types";
import { toScreen, isVisible } from "./common";

export function drawZoneIndicator(
  ctx: CanvasRenderingContext2D,
  zone: Zone,
  cam: Camera,
  cw: number,
  ch: number,
  isActive: boolean
) {
  const { sx, sy } = toScreen(zone.pos, cam, cw, ch);
  if (!isVisible(sx, sy, cw, ch, 300)) return;

  if (isActive) {
    const pulse = 0.4 + Math.sin(Date.now() / 250) * 0.2;
    ctx.strokeStyle = `rgba(50, 120, 200, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(sx, sy - 12, zone.radius * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(20, 35, 60, 0.72)";
    ctx.beginPath();
    ctx.roundRect(sx - 80, sy + 42, 160, 28, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE to enter", sx, sy + 60);
  }
}

export function drawUI(
  ctx: CanvasRenderingContext2D,
  skier: SkierState,
  cw: number,
  ch: number,
  activeZoneLabel: string | null,
  visitedCount: number,
  totalZones: number,
  elapsed: number,
  crashCount: number
) {
  const speed = Math.round(skier.speed * 10);

  ctx.fillStyle = "rgba(15, 25, 40, 0.55)";
  ctx.beginPath();
  ctx.roundRect(15, ch - 60, 100, 46, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`${speed}`, 26, ch - 26);
  ctx.fillStyle = "#8a9ab0";
  ctx.font = "10px sans-serif";
  ctx.fillText("mph", 72, ch - 27);

  // Elevation
  const alt = Math.max(0, Math.round((1 - skier.pos.y / 11000) * 100));
  ctx.fillStyle = "rgba(15, 25, 40, 0.55)";
  ctx.beginPath();
  ctx.roundRect(15, ch - 112, 100, 44, 10);
  ctx.fill();
  ctx.fillStyle = "#c0cad5";
  ctx.font = "10px sans-serif";
  ctx.fillText("Elevation", 26, ch - 94);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.roundRect(26, ch - 82, 75, 7, 3.5);
  ctx.fill();
  ctx.fillStyle = "#4a9ade";
  ctx.beginPath();
  ctx.roundRect(26, ch - 82, 75 * (alt / 100), 7, 3.5);
  ctx.fill();

  // Zone label
  if (activeZoneLabel) {
    ctx.fillStyle = "rgba(20, 80, 170, 0.85)";
    ctx.beginPath();
    ctx.roundRect(cw / 2 - 85, 16, 170, 32, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(activeZoneLabel, cw / 2, 37);
    ctx.textAlign = "left";
  }
}

export function drawStartScreen(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number
) {
  ctx.fillStyle = "rgba(8, 16, 35, 0.8)";
  ctx.fillRect(0, 0, cw, ch);

  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.beginPath();
  ctx.moveTo(cw * 0.15, ch);
  ctx.lineTo(cw * 0.5, ch * 0.2);
  ctx.lineTo(cw * 0.85, ch);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 54px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("David Reko", cw / 2, ch / 2 - 82);

  ctx.fillStyle = "#5ba0e0";
  ctx.font = "22px sans-serif";
  ctx.fillText("Software Engineer \u2014 Generative AI", cw / 2, ch / 2 - 42);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cw / 2 - 140, ch / 2 - 14);
  ctx.lineTo(cw / 2 + 140, ch / 2 - 14);
  ctx.stroke();

  ctx.fillStyle = "#a0b5ca";
  ctx.font = "17px sans-serif";
  ctx.fillText("Ski the mountain to explore my portfolio", cw / 2, ch / 2 + 22);

  ctx.fillStyle = "#6a8098";
  ctx.font = "13px sans-serif";
  ctx.fillText(
    "\u2190 \u2192  steer    \u2193  tuck    \u2191  brake    SPACE  interact    R  reset",
    cw / 2,
    ch / 2 + 56
  );

  const blink = Math.sin(Date.now() / 400) > 0;
  if (blink) {
    ctx.fillStyle = "#f0c830";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Press any key to drop in", cw / 2, ch / 2 + 115);
  }
  ctx.textAlign = "left";
}

export function drawControls(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number
) {
  ctx.fillStyle = "rgba(15, 25, 40, 0.5)";
  ctx.beginPath();
  ctx.roundRect(cw - 230, ch - 100, 215, 85, 10);
  ctx.fill();

  ctx.fillStyle = "#b0c0d0";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("\u2190 \u2192   Steer", cw - 215, ch - 78);
  ctx.fillText("\u2193      Tuck (speed up)", cw - 215, ch - 62);
  ctx.fillText("\u2191      Brake", cw - 215, ch - 46);
  ctx.fillText("SPACE  Enter lodge", cw - 215, ch - 30);
  ctx.fillText("R      Reset to summit", cw - 215, ch - 14);
}

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  skierPos: Vec2,
  zones: Zone[],
  visited: Set<string>
) {
  const mw = 80;
  const mh = 140;
  const mx = cw - mw - 15;
  const my = ch - mh - 15;
  const scaleX = mw / 2000;
  const scaleY = mh / WORLD_H;

  ctx.fillStyle = "rgba(15, 25, 40, 0.5)";
  ctx.beginPath();
  ctx.roundRect(mx - 5, my - 5, mw + 10, mh + 10, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(200, 220, 240, 0.2)";
  ctx.fillRect(mx, my, mw, mh);

  for (const zone of zones) {
    const zx = mx + zone.pos.x * scaleX;
    const zy = my + zone.pos.y * scaleY;
    ctx.fillStyle = visited.has(zone.id) ? "#4ade80" : "#ffc800";
    ctx.beginPath();
    ctx.arc(zx, zy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const sx = mx + skierPos.x * scaleX;
  const sy = my + skierPos.y * scaleY;
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.arc(sx, sy, 3, 0, Math.PI * 2);
  ctx.fill();
  const pulse = 1 + Math.sin(Date.now() / 300) * 0.5;
  ctx.strokeStyle = "rgba(255, 68, 68, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(sx, sy, 3 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
}
