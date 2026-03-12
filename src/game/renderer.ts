import type { Vec2, WorldEntity, SkierState, Zone } from "./types";

interface Camera {
  x: number;
  y: number;
}

function toScreen(
  world: Vec2,
  cam: Camera,
  cw: number,
  ch: number
): { sx: number; sy: number } {
  return {
    sx: world.x - cam.x + cw / 2,
    sy: world.y - cam.y + ch / 3,
  };
}

function isVisible(
  sx: number,
  sy: number,
  cw: number,
  ch: number,
  margin = 100
): boolean {
  return sx > -margin && sx < cw + margin && sy > -margin && sy < ch + margin;
}

// ─── Seeded noise for consistent terrain texture ───
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

// ─── Background (sky + distant mountains) ───

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number
) {
  // Sky
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
    const snowLine = ch * 0.3 - p - parallax + 15;
    ctx.lineTo(x, snowLine);
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

// ─── Terrain (open mountain face) ───

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number
) {
  // Base snow color — natural ungroomed mountain snow
  const snowGrad = ctx.createLinearGradient(0, 0, cw, ch);
  snowGrad.addColorStop(0, "#dce6ee");
  snowGrad.addColorStop(0.3, "#e2eaf2");
  snowGrad.addColorStop(0.7, "#d8e2ec");
  snowGrad.addColorStop(1, "#d0dae6");
  ctx.fillStyle = snowGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Wind-blown snow texture — subtle directional streaks
  ctx.strokeStyle = "rgba(200, 218, 235, 0.25)";
  ctx.lineWidth = 1;
  const windSpacing = 28;
  const worldYTop = cam.y - ch / 3 - 30;
  const startY = Math.floor(worldYTop / windSpacing) * windSpacing;
  for (let wy = startY; wy < worldYTop + ch + 60; wy += windSpacing) {
    const sy = wy - cam.y + ch / 3;
    if (sy < -10 || sy > ch + 10) continue;
    // Wavy wind line
    const offset = hash(0, Math.floor(wy / windSpacing)) * 200;
    ctx.beginPath();
    for (let sx = -20; sx <= cw + 20; sx += 8) {
      const worldX = sx + cam.x - cw / 2;
      const wave = Math.sin(worldX * 0.008 + wy * 0.003) * 3;
      if (sx === -20) ctx.moveTo(sx, sy + wave);
      else ctx.lineTo(sx, sy + wave);
    }
    ctx.stroke();
  }

  // Sastrugi / snow drift shadows — bigger terrain features
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

  // Sun/light direction shading (light from top-left)
  const lightGrad = ctx.createLinearGradient(0, 0, cw, ch);
  lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  lightGrad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
  lightGrad.addColorStop(1, "rgba(0, 20, 50, 0.04)");
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, cw, ch);
}

// ─── Entities ───

function drawTree(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number
) {
  const s = size * 22;

  // Shadow
  ctx.fillStyle = "rgba(40, 60, 80, 0.1)";
  ctx.beginPath();
  ctx.ellipse(sx + s * 0.35, sy + 3, s * 0.45, s * 0.15, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = "#4a2e14";
  ctx.fillRect(sx - 2.5, sy - s * 0.25, 5, s * 0.35);

  // Three crown layers
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

  // Snow on branches
  ctx.fillStyle = "rgba(225, 238, 250, 0.9)";
  // Top cap
  ctx.beginPath();
  ctx.moveTo(sx, sy - s * 1.35);
  ctx.lineTo(sx - s * 0.15, sy - s * 1.1);
  ctx.lineTo(sx + s * 0.15, sy - s * 1.1);
  ctx.closePath();
  ctx.fill();
  // Snow clumps
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

  // Snow
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

  // Main rock body
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

  // Light face
  ctx.fillStyle = "#7a8a98";
  ctx.beginPath();
  ctx.moveTo(sx - s * 0.1, sy - s * 0.7);
  ctx.lineTo(sx + s * 0.2, sy - s * 0.6);
  ctx.lineTo(sx + s * 0.15, sy - s * 0.15);
  ctx.lineTo(sx - s * 0.1, sy - s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Snow dusting on top
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

  // Shadow below cliff
  ctx.fillStyle = "rgba(40, 55, 75, 0.15)";
  ctx.fillRect(sx - w / 2, sy + 2, w, h * 0.4);

  // Rock face
  ctx.fillStyle = "#5a6878";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Lighter top edge
  ctx.fillStyle = "#6e7e8e";
  ctx.fillRect(sx - w / 2, sy - h, w, h * 0.3);

  // Snow on ledge
  ctx.fillStyle = "rgba(215, 230, 245, 0.8)";
  ctx.beginPath();
  ctx.ellipse(sx, sy - h - 1, w * 0.55, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crack detail
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

  // Stump body
  ctx.fillStyle = "#5a3e22";
  ctx.beginPath();
  ctx.ellipse(sx, sy - s * 0.3, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top ring
  ctx.fillStyle = "#7a5832";
  ctx.beginPath();
  ctx.ellipse(sx, sy - s * 0.5, s * 0.45, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snow dusting
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

  // Shadow side
  ctx.fillStyle = "rgba(130, 160, 190, 0.18)";
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + s * 0.12, s * 0.65, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight (sun-facing)
  ctx.fillStyle = "rgba(245, 250, 255, 0.5)";
  ctx.beginPath();
  ctx.ellipse(sx - 1, sy - s * 0.06, s * 0.5, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLodge(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 95 * size;
  const h = 58 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 5, w * 0.6, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(sx - w / 2 - 2, sy - 4, w + 4, 6);

  // Walls
  ctx.fillStyle = "#7a5a3a";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Log lines
  ctx.strokeStyle = "rgba(60, 40, 20, 0.15)";
  ctx.lineWidth = 0.8;
  for (let ly = sy - h + 7; ly < sy - 2; ly += 7) {
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 + 1, ly);
    ctx.lineTo(sx + w / 2 - 1, ly);
    ctx.stroke();
  }

  // Roof
  ctx.fillStyle = "#7a2020";
  ctx.beginPath();
  ctx.moveTo(sx, sy - h - 30 * size);
  ctx.lineTo(sx - w / 2 - 14, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 14, sy - h + 3);
  ctx.closePath();
  ctx.fill();

  // Roof ridge highlight
  ctx.strokeStyle = "#8a3030";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - h - 30 * size);
  ctx.lineTo(sx + w / 2 + 14, sy - h + 3);
  ctx.stroke();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 3, sy - h - 28 * size);
  ctx.lineTo(sx - w / 2 - 10, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 10, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  // Icicles
  ctx.fillStyle = "rgba(190, 218, 240, 0.6)";
  for (let ix = sx - w / 2 - 5; ix <= sx + w / 2 + 5; ix += 10) {
    const ih = 3 + Math.abs(Math.sin(ix * 0.3)) * 4;
    ctx.beginPath();
    ctx.moveTo(ix - 1.2, sy - h + 3);
    ctx.lineTo(ix, sy - h + 3 + ih);
    ctx.lineTo(ix + 1.2, sy - h + 3);
    ctx.closePath();
    ctx.fill();
  }

  // Door
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 10 * size, sy - 32 * size, 20 * size, 32 * size, [5, 5, 0, 0]);
  ctx.fill();
  ctx.fillStyle = "#c8952a";
  ctx.beginPath();
  ctx.arc(sx + 6 * size, sy - 16 * size, 2, 0, Math.PI * 2);
  ctx.fill();

  // Windows
  const winW = 16 * size;
  const winH = 13 * size;
  for (const wx of [sx - w / 2 + 9, sx + w / 2 - 9 - winW]) {
    // Warm glow
    ctx.fillStyle = "#f0c830";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(wx, sy - h + 15, winW, winH, 2);
    ctx.fill();
    // Pane cross
    ctx.strokeStyle = "#6a4a2a";
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(wx + winW / 2, sy - h + 15);
    ctx.lineTo(wx + winW / 2, sy - h + 15 + winH);
    ctx.moveTo(wx, sy - h + 15 + winH / 2);
    ctx.lineTo(wx + winW, sy - h + 15 + winH / 2);
    ctx.stroke();
    // Frame
    ctx.strokeStyle = "#5a3a1a";
    ctx.strokeRect(wx, sy - h + 15, winW, winH);
  }

  // Chimney
  ctx.fillStyle = "#5a3a22";
  ctx.fillRect(sx + w / 4, sy - h - 22 * size, 11 * size, 18 * size);
  ctx.fillStyle = "#4a2a18";
  ctx.fillRect(sx + w / 4 - 2, sy - h - 24 * size, 15 * size, 4);

  // Smoke
  ctx.fillStyle = "rgba(190, 200, 215, 0.25)";
  const t = Date.now() / 1200;
  for (let i = 0; i < 4; i++) {
    const smokeX = sx + w / 4 + 5.5 * size + Math.sin(t * 0.8 + i * 1.8) * 6;
    const smokeY = sy - h - 26 * size - i * 11 - Math.sin(t + i) * 3;
    const r = 4 + i * 2.5;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Name sign
  ctx.fillStyle = "rgba(250, 245, 230, 0.95)";
  const signW = Math.max(label.length * 7.5 + 16, 80);
  ctx.beginPath();
  ctx.roundRect(sx - signW / 2, sy - h - 48 * size, signW, 22, 4);
  ctx.fill();
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(sx - signW / 2, sy - h - 48 * size, signW, 22);
  ctx.fillStyle = "#2a1a08";
  ctx.font = `bold ${12 * Math.min(size, 1.2)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(label, sx, sy - h - 33 * size);
}

function drawSign(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  label: string
) {
  // Shadow
  ctx.fillStyle = "rgba(40, 60, 80, 0.07)";
  ctx.beginPath();
  ctx.ellipse(sx + 2, sy + 3, 5, 2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Post
  ctx.fillStyle = "#4a2e14";
  ctx.fillRect(sx - 2, sy - 35, 4, 40);

  // Sign board
  ctx.fillStyle = "#eee5d0";
  ctx.beginPath();
  ctx.roundRect(sx - 38, sy - 48, 76, 22, 3);
  ctx.fill();
  ctx.strokeStyle = "#8a6a42";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx - 38, sy - 48, 76, 22);

  // Arrow
  ctx.fillStyle = "#1a6a28";
  ctx.beginPath();
  ctx.moveTo(sx + 31, sy - 37);
  ctx.lineTo(sx + 24, sy - 42);
  ctx.lineTo(sx + 24, sy - 32);
  ctx.closePath();
  ctx.fill();

  // Text
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
      drawLodge(ctx, sx, sy, entity.size, entity.label ?? "");
      break;
    case "sign":
      drawSign(ctx, sx, sy, entity.label ?? "");
      break;
  }
}

// ─── Skier ───

export function drawSkier(
  ctx: CanvasRenderingContext2D,
  skier: SkierState,
  cam: Camera,
  cw: number,
  ch: number
) {
  const { sx, sy } = toScreen(skier.pos, cam, cw, ch);

  // Invincibility blink
  if (skier.invincible > 0 && Math.floor(skier.invincible / 4) % 2 === 0) {
    return;
  }

  // Shadow
  if (!skier.crashed) {
    ctx.fillStyle = "rgba(40, 60, 80, 0.12)";
    ctx.beginPath();
    ctx.ellipse(sx + 2, sy + 10, 9, 3.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  if (skier.crashed) {
    drawCrashedSkier(ctx, sx, sy, skier.crashTimer);
    return;
  }

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(skier.angle);

  const tuck = skier.isTucking;

  // ─── Skis ───
  ctx.fillStyle = "#1a2530";
  const skiLen = tuck ? 22 : 20;
  const skiW = 3;
  // Left ski
  ctx.beginPath();
  ctx.roundRect(-6, 3, skiW, skiLen, 1.5);
  ctx.fill();
  // Right ski
  ctx.beginPath();
  ctx.roundRect(3, 3, skiW, skiLen, 1.5);
  ctx.fill();
  // Ski tips (curved up)
  ctx.fillStyle = "#2a3540";
  ctx.beginPath();
  ctx.ellipse(-4.5, 3, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4.5, 3, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ─── Boots ───
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-6.5, 1, 5, 5);
  ctx.fillRect(1.5, 1, 5, 5);

  // ─── Legs (ski pants) ───
  ctx.strokeStyle = "#1a3050";
  ctx.lineWidth = 3.5;
  const kneeY = tuck ? -1 : -3;
  ctx.beginPath();
  ctx.moveTo(-4, kneeY);
  ctx.lineTo(-5, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, kneeY);
  ctx.lineTo(5, 3);
  ctx.stroke();

  // ─── Body / Jacket ───
  const bodyTop = tuck ? -9 : -14;
  const bodyH = tuck ? 10 : 13;
  // Jacket body
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.roundRect(-8, bodyTop, 16, bodyH, 4);
  ctx.fill();
  // Jacket detail — zipper line
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, bodyTop + 2);
  ctx.lineTo(0, bodyTop + bodyH - 2);
  ctx.stroke();
  // Collar
  ctx.fillStyle = "#aa1a1a";
  ctx.fillRect(-6, bodyTop, 12, 3);

  // ─── Arms ───
  ctx.strokeStyle = "#cc2222";
  ctx.lineWidth = 3;
  const shoulderY = bodyTop + 4;
  const elbowOut = tuck ? 10 : 12;
  const handY = shoulderY + (tuck ? 3 : 8);
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-8, shoulderY);
  ctx.lineTo(-elbowOut - 3, handY);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(8, shoulderY);
  ctx.lineTo(elbowOut + 3, handY);
  ctx.stroke();

  // Gloves
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(-elbowOut - 3, handY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(elbowOut + 3, handY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // ─── Poles ───
  ctx.strokeStyle = "#8a9aaa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-elbowOut - 3, handY);
  ctx.lineTo(-elbowOut - 1, handY + 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(elbowOut + 3, handY);
  ctx.lineTo(elbowOut + 1, handY + 22);
  ctx.stroke();
  // Baskets
  ctx.strokeStyle = "#6a7a88";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(-elbowOut - 1, handY + 22, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(elbowOut + 1, handY + 22, 3, 0, Math.PI * 2);
  ctx.stroke();

  // ─── Head ───
  const headY = bodyTop - 6;
  // Neck
  ctx.fillStyle = "#f0c8a0";
  ctx.fillRect(-2, bodyTop - 2, 4, 3);
  // Head
  ctx.fillStyle = "#f0c8a0";
  ctx.beginPath();
  ctx.arc(0, headY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  // Helmet
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.arc(0, headY - 1.5, 7, Math.PI * 1.15, Math.PI * -0.15);
  ctx.fill();
  // Helmet brim
  ctx.fillStyle = "#aa1a1a";
  ctx.beginPath();
  ctx.ellipse(0, headY + 1, 7.5, 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Goggles
  ctx.fillStyle = "#12121e";
  ctx.beginPath();
  ctx.roundRect(-6, headY - 2.5, 12, 5, 2.5);
  ctx.fill();
  // Goggle lenses
  ctx.fillStyle = "#3498db";
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(-2.5, headY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, headY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Lens reflection
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(-3.5, headY - 0.8, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2, headY - 0.8, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // ─── Ski tracks ───
  if (skier.trail.length > 2) {
    ctx.strokeStyle = "rgba(140, 165, 195, 0.2)";
    ctx.lineWidth = 1.5;
    for (const offset of [-3.5, 3.5]) {
      ctx.beginPath();
      for (let i = 0; i < skier.trail.length; i++) {
        const p = toScreen(skier.trail[i], cam, cw, ch);
        if (i === 0) ctx.moveTo(p.sx + offset, p.sy);
        else ctx.lineTo(p.sx + offset, p.sy);
      }
      ctx.stroke();
    }
  }

  // ─── Snow spray ───
  if (Math.abs(skier.angle) > 0.25 && skier.speed > 2.5 && !skier.isBraking) {
    const dir = skier.angle > 0 ? -1 : 1;
    for (let i = 0; i < 8; i++) {
      const ox = sx + dir * (6 + Math.random() * 20);
      const oy = sy + 6 + Math.random() * 14;
      const r = 1 + Math.random() * 3.5;
      ctx.fillStyle = `rgba(220, 238, 255, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCrashedSkier(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  timer: number
) {
  ctx.save();
  ctx.translate(sx, sy);
  const rot = Math.PI / 5 + Math.sin(timer * 0.4) * 0.15;
  ctx.rotate(rot);

  // Impact poof
  if (timer < 15) {
    ctx.fillStyle = `rgba(220, 238, 255, ${0.5 - timer * 0.03})`;
    const pr = 15 + timer * 2;
    ctx.beginPath();
    ctx.arc(0, 0, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scattered equipment
  // Ski 1
  ctx.fillStyle = "#1a2530";
  ctx.save();
  ctx.rotate(0.6);
  ctx.beginPath();
  ctx.roundRect(-16, 6, 3, 18, 1.5);
  ctx.fill();
  ctx.restore();
  // Ski 2
  ctx.save();
  ctx.rotate(-0.8);
  ctx.beginPath();
  ctx.roundRect(4, 9, 3, 16, 1.5);
  ctx.fill();
  ctx.restore();
  // Pole
  ctx.strokeStyle = "#8a9aaa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(8, 15);
  ctx.stroke();

  // Body sprawled
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.roundRect(-9, -5, 18, 10, 3);
  ctx.fill();
  // Head
  ctx.fillStyle = "#f0c8a0";
  ctx.beginPath();
  ctx.arc(-6, -10, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.arc(-6, -11.5, 6, Math.PI * 1.1, -0.1);
  ctx.fill();
  // Goggles askew
  ctx.fillStyle = "#12121e";
  ctx.beginPath();
  ctx.roundRect(-10, -12, 9, 3.5, 1.5);
  ctx.fill();

  // Stars
  if (timer < 40) {
    ctx.fillStyle = "#f0c830";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    const orbit = timer * 0.12;
    for (let i = 0; i < 3; i++) {
      const a = orbit + (i * Math.PI * 2) / 3;
      const r = 18;
      ctx.fillText("✦", Math.cos(a) * r, -15 + Math.sin(a) * 8);
    }
  }

  ctx.restore();
}

// ─── Zone indicators ───

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

// ─── UI ───

export function drawUI(
  ctx: CanvasRenderingContext2D,
  skier: SkierState,
  cw: number,
  ch: number,
  activeZoneLabel: string | null
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
  // Bar
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

  // Mountain silhouette
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
  ctx.fillText("Software Engineer — Generative AI", cw / 2, ch / 2 - 42);

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
    "← →  steer    ↓  tuck    ↑  brake    SPACE  interact    R  reset",
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
  ctx.fillText("← →   Steer", cw - 215, ch - 78);
  ctx.fillText("↓      Tuck (speed up)", cw - 215, ch - 62);
  ctx.fillText("↑      Brake", cw - 215, ch - 46);
  ctx.fillText("SPACE  Enter lodge", cw - 215, ch - 30);
  ctx.fillText("R      Reset to summit", cw - 215, ch - 14);
}
