import type { WorldEntity, Camera } from "../types";
import { toScreen, isVisible } from "./common";
import { drawLodge } from "./lodges";

function drawTree(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 22;

  ctx.fillStyle = "rgba(40, 60, 80, 0.1)";
  ctx.beginPath();
  ctx.ellipse(sx + s * 0.35, sy + 3, s * 0.45, s * 0.15, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a2e14";
  ctx.fillRect(sx - 2.5, sy - s * 0.25, 5, s * 0.35);

  const layers = [
    { yOff: -1.35, w: 0.3, color: "#1a4520" },
    { yOff: -1.0, w: 0.48, color: "#1e5528" },
    { yOff: -0.65, w: 0.58, color: "#1a4d22" },
    { yOff: -0.3, w: 0.65, color: "#165018" },
  ];
  for (const l of layers) {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.moveTo(sx, sy + l.yOff * s);
    ctx.lineTo(sx - s * l.w, sy + (l.yOff + 0.35) * s);
    ctx.lineTo(sx + s * l.w, sy + (l.yOff + 0.35) * s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(225, 238, 250, 0.9)";
  ctx.beginPath();
  ctx.moveTo(sx, sy - s * 1.35);
  ctx.lineTo(sx - s * 0.15, sy - s * 1.1);
  ctx.lineTo(sx + s * 0.15, sy - s * 1.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx - s * 0.22, sy - s * 0.75, s * 0.13, s * 0.05, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx + s * 0.18, sy - s * 0.55, s * 0.11, s * 0.045, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(sx - s * 0.3, sy - s * 0.38, s * 0.1, s * 0.04, -0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawSmallTree(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 16;

  ctx.fillStyle = "rgba(40, 60, 80, 0.07)";
  ctx.beginPath();
  ctx.ellipse(sx + s * 0.25, sy + 2, s * 0.35, s * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3e2210";
  ctx.fillRect(sx - 1.5, sy - s * 0.15, 3, s * 0.25);

  ctx.fillStyle = "#1e5825";
  ctx.beginPath();
  ctx.moveTo(sx, sy - s * 1.15);
  ctx.lineTo(sx - s * 0.38, sy - s * 0.15);
  ctx.lineTo(sx + s * 0.38, sy - s * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#236a2e";
  ctx.beginPath();
  ctx.moveTo(sx, sy - s * 0.8);
  ctx.lineTo(sx - s * 0.48, sy + s * 0.05);
  ctx.lineTo(sx + s * 0.48, sy + s * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(225, 238, 250, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx, sy - s * 1.15);
  ctx.lineTo(sx - s * 0.15, sy - s * 0.85);
  ctx.lineTo(sx + s * 0.15, sy - s * 0.85);
  ctx.closePath();
  ctx.fill();
}

function drawRock(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 16;

  ctx.fillStyle = "rgba(40, 60, 80, 0.1)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 3, s * 0.6, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5c6b78";
  ctx.beginPath();
  ctx.moveTo(sx - s * 0.5, sy);
  ctx.lineTo(sx - s * 0.4, sy - s * 0.55);
  ctx.lineTo(sx - s * 0.1, sy - s * 0.7);
  ctx.lineTo(sx + s * 0.2, sy - s * 0.6);
  ctx.lineTo(sx + s * 0.5, sy - s * 0.3);
  ctx.lineTo(sx + s * 0.45, sy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#7a8a98";
  ctx.beginPath();
  ctx.moveTo(sx - s * 0.1, sy - s * 0.7);
  ctx.lineTo(sx + s * 0.2, sy - s * 0.6);
  ctx.lineTo(sx + s * 0.15, sy - s * 0.15);
  ctx.lineTo(sx - s * 0.1, sy - s * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(220, 235, 248, 0.65)";
  ctx.beginPath();
  ctx.moveTo(sx - s * 0.35, sy - s * 0.5);
  ctx.quadraticCurveTo(sx, sy - s * 0.8, sx + s * 0.3, sy - s * 0.5);
  ctx.quadraticCurveTo(sx, sy - s * 0.55, sx - s * 0.35, sy - s * 0.5);
  ctx.fill();
}

function drawCliff(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const w = 35 * size;
  const h = 18 * size;

  ctx.fillStyle = "rgba(40, 55, 75, 0.15)";
  ctx.fillRect(sx - w / 2, sy + 2, w, h * 0.4);

  ctx.fillStyle = "#5a6878";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  ctx.fillStyle = "#6e7e8e";
  ctx.fillRect(sx - w / 2, sy - h, w, h * 0.3);

  ctx.fillStyle = "rgba(215, 230, 245, 0.8)";
  ctx.beginPath();
  ctx.ellipse(sx, sy - h - 1, w * 0.55, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(40, 50, 60, 0.2)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - w * 0.2, sy - h);
  ctx.lineTo(sx - w * 0.15, sy);
  ctx.stroke();
}

function drawStump(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 10;

  ctx.fillStyle = "rgba(40, 60, 80, 0.06)";
  ctx.beginPath();
  ctx.ellipse(sx + 1, sy + 1, s * 0.7, s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a3e22";
  ctx.beginPath();
  ctx.ellipse(sx, sy - s * 0.3, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7a5832";
  ctx.beginPath();
  ctx.ellipse(sx, sy - s * 0.5, s * 0.45, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(220, 235, 248, 0.5)";
  ctx.beginPath();
  ctx.ellipse(sx, sy - s * 0.55, s * 0.3, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMogul(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 22;

  ctx.fillStyle = "rgba(130, 160, 190, 0.18)";
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + s * 0.12, s * 0.65, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(245, 250, 255, 0.5)";
  ctx.beginPath();
  ctx.ellipse(sx - 1, sy - s * 0.06, s * 0.5, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawIcePatch(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const w = size * 50;
  const h = size * 28;

  ctx.fillStyle = "rgba(150, 215, 250, 0.2)";
  ctx.beginPath();
  ctx.ellipse(sx, sy, w, h, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(200, 235, 255, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx - w * 0.15, sy - h * 0.15, w * 0.6, h * 0.4, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(120, 195, 240, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(sx, sy, w, h, 0.15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  const t = Date.now() / 1000;
  for (let i = 0; i < 4; i++) {
    const sparkleX = sx + Math.cos(t + i * 1.5) * w * 0.5;
    const sparkleY = sy + Math.sin(t * 0.7 + i * 2) * h * 0.4;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSign(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  label: string
) {
  ctx.fillStyle = "rgba(40, 60, 80, 0.07)";
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + 3, 5, 2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a2e14";
  ctx.fillRect(sx - 2, sy - 35, 4, 40);

  ctx.fillStyle = "#eee5d0";
  ctx.beginPath();
  ctx.roundRect(sx - 38, sy - 48, 76, 22, 3);
  ctx.fill();
  ctx.strokeStyle = "#8a6a42";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx - 38, sy - 48, 76, 22);

  ctx.fillStyle = "#1a6a28";
  ctx.beginPath();
  ctx.moveTo(sx + 31, sy - 37);
  ctx.lineTo(sx + 24, sy - 42);
  ctx.lineTo(sx + 24, sy - 32);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, sx - 4, sy - 34);
}

export function drawEntity(
  ctx: CanvasRenderingContext2D,
  entity: WorldEntity,
  cam: Camera,
  cw: number,
  ch: number
) {
  const { sx, sy } = toScreen(entity.pos, cam, cw, ch);
  if (!isVisible(sx, sy, cw, ch, 150)) return;

  switch (entity.type) {
    case "tree":
      drawTree(ctx, sx, sy, entity.size);
      break;
    case "treeSmall":
      drawSmallTree(ctx, sx, sy, entity.size);
      break;
    case "rock":
      drawRock(ctx, sx, sy, entity.size);
      break;
    case "cliff":
      drawCliff(ctx, sx, sy, entity.size);
      break;
    case "stump":
      drawStump(ctx, sx, sy, entity.size);
      break;
    case "mogul":
      drawMogul(ctx, sx, sy, entity.size);
      break;
    case "lodge":
      drawLodge(ctx, sx, sy, entity.size, entity.label ?? "", entity.zoneId);
      break;
    case "sign":
      drawSign(ctx, sx, sy, entity.label ?? "");
      break;
    case "ice":
      drawIcePatch(ctx, sx, sy, entity.size);
      break;
  }
}
