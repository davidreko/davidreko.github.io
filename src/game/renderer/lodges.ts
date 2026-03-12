// ─── Distinct lodge designs per zone ───

/** Shared helper: draw a name sign above a building */
function drawNameSign(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  label: string,
  signY: number
) {
  ctx.fillStyle = "rgba(250, 245, 230, 0.95)";
  const signW = Math.max(label.length * 7.5 + 16, 80);
  ctx.beginPath();
  ctx.roundRect(sx - signW / 2, signY, signW, 22, 4);
  ctx.fill();
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(sx - signW / 2, signY, signW, 22);
  ctx.fillStyle = "#2a1a08";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, sx, signY + 15);
}

/** Shared helper: draw chimney with smoke */
function drawChimney(
  ctx: CanvasRenderingContext2D,
  cx: number,
  roofY: number,
  size: number
) {
  ctx.fillStyle = "#5a3a22";
  ctx.fillRect(cx, roofY, 11 * size, 18 * size);
  ctx.fillStyle = "#4a2a18";
  ctx.fillRect(cx - 2, roofY - 2, 15 * size, 4);

  ctx.fillStyle = "rgba(190, 200, 215, 0.25)";
  const t = Date.now() / 1200;
  for (let i = 0; i < 4; i++) {
    const smokeX = cx + 5.5 * size + Math.sin(t * 0.8 + i * 1.8) * 6;
    const smokeY = roofY - 8 - i * 11 - Math.sin(t + i) * 3;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, 4 + i * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Shared helper: draw icicles along eave */
function drawIcicles(
  ctx: CanvasRenderingContext2D,
  xStart: number,
  xEnd: number,
  y: number
) {
  ctx.fillStyle = "rgba(190, 218, 240, 0.6)";
  for (let ix = xStart; ix <= xEnd; ix += 10) {
    const ih = 3 + Math.abs(Math.sin(ix * 0.3)) * 4;
    ctx.beginPath();
    ctx.moveTo(ix - 1.2, y);
    ctx.lineTo(ix, y + ih);
    ctx.lineTo(ix + 1.2, y);
    ctx.closePath();
    ctx.fill();
  }
}

/** Shared helper: draw a window with warm glow */
function drawWindow(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  ww: number,
  wh: number
) {
  ctx.fillStyle = "#f0c830";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, wh, 2);
  ctx.fill();
  ctx.strokeStyle = "#6a4a2a";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy);
  ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.moveTo(wx, wy + wh / 2);
  ctx.lineTo(wx + ww, wy + wh / 2);
  ctx.stroke();
  ctx.strokeStyle = "#5a3a1a";
  ctx.strokeRect(wx, wy, ww, wh);
}

// ─── About: Cozy info cabin with welcome mat ───

function drawInfoCabin(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 70 * size;
  const h = 48 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 5, w * 0.55, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(sx - w / 2 - 2, sy - 4, w + 4, 6);

  // Walls — warm cedar
  ctx.fillStyle = "#8a6840";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Horizontal log lines
  ctx.strokeStyle = "rgba(60, 40, 20, 0.12)";
  ctx.lineWidth = 0.8;
  for (let ly = sy - h + 7; ly < sy - 2; ly += 6) {
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 + 1, ly);
    ctx.lineTo(sx + w / 2 - 1, ly);
    ctx.stroke();
  }

  // Steep A-frame roof
  const roofPeak = sy - h - 35 * size;
  ctx.fillStyle = "#2a6030";
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx - w / 2 - 12, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 12, sy - h + 3);
  ctx.closePath();
  ctx.fill();

  // Roof highlight
  ctx.strokeStyle = "#3a7040";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx + w / 2 + 12, sy - h + 3);
  ctx.stroke();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 2, roofPeak + 3);
  ctx.lineTo(sx - w / 2 - 8, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 8, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2 - 5, sx + w / 2 + 5, sy - h + 3);

  // Door — arched, open/welcoming
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 9 * size, sy - 30 * size, 18 * size, 30 * size, [8, 8, 0, 0]);
  ctx.fill();
  // Warm interior glow from open door
  ctx.fillStyle = "rgba(240, 200, 100, 0.3)";
  ctx.beginPath();
  ctx.roundRect(sx - 7 * size, sy - 28 * size, 14 * size, 28 * size, [6, 6, 0, 0]);
  ctx.fill();

  // Windows
  const winW = 14 * size;
  const winH = 11 * size;
  drawWindow(ctx, sx - w / 2 + 7, sy - h + 14, winW, winH);
  drawWindow(ctx, sx + w / 2 - 7 - winW, sy - h + 14, winW, winH);

  // "i" info circle on door
  ctx.fillStyle = "#4a90d9";
  ctx.beginPath();
  ctx.arc(sx, sy - 20 * size, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px serif";
  ctx.textAlign = "center";
  ctx.fillText("i", sx, sy - 17.5 * size);

  // Welcome mat
  ctx.fillStyle = "#8a3030";
  ctx.fillRect(sx - 12 * size, sy - 2, 24 * size, 4);

  drawNameSign(ctx, sx, sy, label, roofPeak - 22);
}

// ─── Experience: Tall office / corporate building ───

function drawOfficeLodge(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 100 * size;
  const h = 72 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 5, w * 0.6, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(sx - w / 2 - 2, sy - 4, w + 4, 6);

  // Main walls — professional gray-brown
  ctx.fillStyle = "#6a5a4a";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Horizontal siding
  ctx.strokeStyle = "rgba(50, 40, 30, 0.1)";
  ctx.lineWidth = 0.6;
  for (let ly = sy - h + 6; ly < sy - 2; ly += 5) {
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 + 1, ly);
    ctx.lineTo(sx + w / 2 - 1, ly);
    ctx.stroke();
  }

  // Second floor divider
  const midY = sy - h * 0.5;
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(sx - w / 2, midY - 1.5, w, 3);

  // Gabled roof
  const roofPeak = sy - h - 25 * size;
  ctx.fillStyle = "#4a3528";
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx - w / 2 - 10, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 10, sy - h + 3);
  ctx.closePath();
  ctx.fill();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 2, roofPeak + 3);
  ctx.lineTo(sx - w / 2 - 6, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 6, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2 - 5, sx + w / 2 + 5, sy - h + 3);

  // Upper floor windows (3 across)
  const winW = 13 * size;
  const winH = 11 * size;
  const upperY = sy - h + 12;
  for (let i = 0; i < 3; i++) {
    const wx = sx - w / 2 + 10 + i * (w / 3 - 3);
    drawWindow(ctx, wx, upperY, winW, winH);
  }

  // Lower floor windows (3 across)
  const lowerY = midY + 6;
  for (let i = 0; i < 3; i++) {
    const wx = sx - w / 2 + 10 + i * (w / 3 - 3);
    drawWindow(ctx, wx, lowerY, winW, winH);
  }

  // Double doors
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 12 * size, sy - 28 * size, 24 * size, 28 * size, [4, 4, 0, 0]);
  ctx.fill();
  // Door split
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 28 * size + 4);
  ctx.lineTo(sx, sy);
  ctx.stroke();
  // Handles
  ctx.fillStyle = "#c8952a";
  ctx.beginPath();
  ctx.arc(sx - 3, sy - 14 * size, 1.5, 0, Math.PI * 2);
  ctx.arc(sx + 3, sy - 14 * size, 1.5, 0, Math.PI * 2);
  ctx.fill();

  drawChimney(ctx, sx + w / 4, sy - h - 20 * size, size);
  drawNameSign(ctx, sx, sy, label, roofPeak - 22);
}

// ─── Education: Academic hall with columns ───

function drawAcademicHall(
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
  ctx.ellipse(sx + 3, sy + 5, w * 0.6, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation — stone
  ctx.fillStyle = "#6a6a72";
  ctx.fillRect(sx - w / 2 - 4, sy - 4, w + 8, 7);

  // Walls — brick-like warm stone
  ctx.fillStyle = "#8a7060";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Brick pattern
  ctx.strokeStyle = "rgba(60, 45, 35, 0.08)";
  ctx.lineWidth = 0.5;
  for (let ly = sy - h + 5; ly < sy - 3; ly += 5) {
    ctx.beginPath();
    ctx.moveTo(sx - w / 2 + 1, ly);
    ctx.lineTo(sx + w / 2 - 1, ly);
    ctx.stroke();
    const offset = Math.floor(ly / 5) % 2 === 0 ? 0 : 8;
    for (let bx = sx - w / 2 + offset; bx < sx + w / 2; bx += 16) {
      ctx.beginPath();
      ctx.moveTo(bx, ly);
      ctx.lineTo(bx, ly + 5);
      ctx.stroke();
    }
  }

  // Pediment (triangular classical facade)
  const pedimentH = 20 * size;
  ctx.fillStyle = "#9a8878";
  ctx.beginPath();
  ctx.moveTo(sx, sy - h - pedimentH);
  ctx.lineTo(sx - w / 2 - 4, sy - h + 2);
  ctx.lineTo(sx + w / 2 + 4, sy - h + 2);
  ctx.closePath();
  ctx.fill();

  // Pediment border
  ctx.strokeStyle = "#7a6a5a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - h - pedimentH);
  ctx.lineTo(sx - w / 2 - 4, sy - h + 2);
  ctx.moveTo(sx, sy - h - pedimentH);
  ctx.lineTo(sx + w / 2 + 4, sy - h + 2);
  ctx.stroke();

  // Snow on pediment
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 2, sy - h - pedimentH + 3);
  ctx.lineTo(sx - w / 2, sy - h + 2);
  ctx.lineTo(sx + w / 2, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2, sx + w / 2, sy - h + 2);

  // Columns
  ctx.fillStyle = "#b0a898";
  const colPositions = [
    sx - w / 2 + 10,
    sx - w / 2 + 25,
    sx + w / 2 - 10,
    sx + w / 2 - 25,
  ];
  for (const cx of colPositions) {
    // Column shaft
    ctx.fillStyle = "#b0a898";
    ctx.fillRect(cx - 3.5, sy - h + 4, 7, h - 8);
    // Capital
    ctx.fillStyle = "#c0b8a8";
    ctx.fillRect(cx - 5, sy - h + 2, 10, 4);
    // Base
    ctx.fillRect(cx - 5, sy - 6, 10, 4);
  }

  // Arched entrance
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 10 * size, sy - 34 * size, 20 * size, 34 * size, [10, 10, 0, 0]);
  ctx.fill();
  // Arch highlight
  ctx.strokeStyle = "#8a7060";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy - 34 * size + 10, 10 * size, Math.PI, 0);
  ctx.stroke();

  // Windows — tall arched
  const winW = 12 * size;
  const winH = 16 * size;
  drawWindow(ctx, sx - w / 2 + 32, sy - h + 14, winW, winH);
  drawWindow(ctx, sx + w / 2 - 32 - winW, sy - h + 14, winW, winH);

  // Bell tower / cupola
  const bellX = sx;
  const bellBase = sy - h - pedimentH;
  ctx.fillStyle = "#8a7868";
  ctx.fillRect(bellX - 6, bellBase - 18 * size, 12, 18 * size);
  // Bell dome
  ctx.fillStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.arc(bellX, bellBase - 18 * size, 8, Math.PI, 0);
  ctx.fill();
  // Snow on dome
  ctx.fillStyle = "rgba(230, 242, 252, 0.8)";
  ctx.beginPath();
  ctx.arc(bellX, bellBase - 18 * size - 1, 7, Math.PI * 1.1, -0.1);
  ctx.fill();

  drawNameSign(ctx, sx, sy, label, bellBase - 18 * size - 28);
}

// ─── Skills: Workshop / gear shop ───

function drawWorkshop(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 105 * size;
  const h = 45 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 5, w * 0.6, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation
  ctx.fillStyle = "#5a5a5e";
  ctx.fillRect(sx - w / 2 - 2, sy - 3, w + 4, 5);

  // Walls — industrial gray-green
  ctx.fillStyle = "#5a6858";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Corrugated metal siding
  ctx.strokeStyle = "rgba(80, 95, 78, 0.2)";
  ctx.lineWidth = 0.6;
  for (let lx = sx - w / 2 + 4; lx < sx + w / 2; lx += 6) {
    ctx.beginPath();
    ctx.moveTo(lx, sy - h + 2);
    ctx.lineTo(lx, sy - 2);
    ctx.stroke();
  }

  // Shed roof (sloped, not peaked)
  const roofFront = sy - h - 8 * size;
  const roofBack = sy - h - 18 * size;
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.moveTo(sx - w / 2 - 8, roofFront);
  ctx.lineTo(sx + w / 2 + 8, roofFront);
  ctx.lineTo(sx + w / 2 + 8, roofBack);
  ctx.lineTo(sx - w / 2 - 8, roofBack);
  ctx.closePath();
  ctx.fill();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.8)";
  ctx.beginPath();
  ctx.moveTo(sx - w / 2 - 6, roofBack + 1);
  ctx.lineTo(sx + w / 2 + 6, roofBack + 1);
  ctx.lineTo(sx + w / 2 + 6, roofBack + 5);
  ctx.lineTo(sx - w / 2 - 6, roofBack + 5);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2 - 5, sx + w / 2 + 5, roofFront);

  // Large garage/workshop door
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(sx - 16 * size, sy - 32 * size, 32 * size, 32 * size);
  // Roll-up door panels
  ctx.strokeStyle = "rgba(60, 60, 68, 0.4)";
  ctx.lineWidth = 0.8;
  for (let dy = sy - 30 * size; dy < sy - 2; dy += 6) {
    ctx.beginPath();
    ctx.moveTo(sx - 14 * size, dy);
    ctx.lineTo(sx + 14 * size, dy);
    ctx.stroke();
  }
  // Door handle
  ctx.fillStyle = "#8a8a92";
  ctx.fillRect(sx - 2, sy - 10, 4, 6);

  // Side windows
  const winW = 14 * size;
  const winH = 10 * size;
  drawWindow(ctx, sx - w / 2 + 6, sy - h + 12, winW, winH);
  drawWindow(ctx, sx + w / 2 - 6 - winW, sy - h + 12, winW, winH);

  // Overhead lamp
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(sx - 2, roofFront - 2, 4, 8);
  ctx.fillStyle = "rgba(255, 240, 180, 0.5)";
  ctx.beginPath();
  ctx.arc(sx, roofFront + 8, 5, 0, Math.PI * 2);
  ctx.fill();
  // Light cone
  ctx.fillStyle = "rgba(255, 240, 180, 0.08)";
  ctx.beginPath();
  ctx.moveTo(sx - 3, roofFront + 10);
  ctx.lineTo(sx - 18, sy);
  ctx.lineTo(sx + 18, sy);
  ctx.lineTo(sx + 3, roofFront + 10);
  ctx.closePath();
  ctx.fill();

  // Ventilation pipe on roof
  ctx.fillStyle = "#5a5a62";
  ctx.fillRect(sx + w / 4, roofBack - 10, 8, 12);
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(sx + w / 4 + 4, roofBack - 10, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  drawNameSign(ctx, sx, sy, label, roofBack - 26);
}

// ─── Projects: Builder's workshop with blueprints ───

function drawBuilderShop(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 85 * size;
  const h = 52 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.15)";
  ctx.beginPath();
  ctx.ellipse(sx + 3, sy + 5, w * 0.55, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(sx - w / 2 - 2, sy - 4, w + 4, 6);

  // Walls — natural wood
  ctx.fillStyle = "#7a6040";
  ctx.fillRect(sx - w / 2, sy - h, w, h);

  // Wood plank lines (vertical board-and-batten)
  ctx.strokeStyle = "rgba(60, 40, 20, 0.12)";
  ctx.lineWidth = 0.6;
  for (let lx = sx - w / 2 + 8; lx < sx + w / 2; lx += 12) {
    ctx.beginPath();
    ctx.moveTo(lx, sy - h + 2);
    ctx.lineTo(lx, sy - 2);
    ctx.stroke();
  }

  // A-frame roof
  const roofPeak = sy - h - 28 * size;
  ctx.fillStyle = "#5a3020";
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx - w / 2 - 12, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 12, sy - h + 3);
  ctx.closePath();
  ctx.fill();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 2, roofPeak + 3);
  ctx.lineTo(sx - w / 2 - 8, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 8, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2 - 5, sx + w / 2 + 5, sy - h + 3);

  // Door
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 9 * size, sy - 30 * size, 18 * size, 30 * size, [4, 4, 0, 0]);
  ctx.fill();
  ctx.fillStyle = "#c8952a";
  ctx.beginPath();
  ctx.arc(sx + 5 * size, sy - 15 * size, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Windows
  const winW = 14 * size;
  const winH = 11 * size;
  drawWindow(ctx, sx - w / 2 + 8, sy - h + 15, winW, winH);
  drawWindow(ctx, sx + w / 2 - 8 - winW, sy - h + 15, winW, winH);

  drawChimney(ctx, sx + w / 4, sy - h - 18 * size, size);

  // Blueprint / drawing board leaning against wall
  ctx.fillStyle = "#1a4a7a";
  ctx.save();
  ctx.translate(sx + w / 2 + 4, sy - 6);
  ctx.rotate(-0.15);
  ctx.fillRect(0, -28, 16, 22);
  // Grid lines on blueprint
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 0.4;
  for (let g = -24; g < -8; g += 4) {
    ctx.beginPath();
    ctx.moveTo(2, g);
    ctx.lineTo(14, g);
    ctx.stroke();
  }
  for (let g = 2; g < 14; g += 4) {
    ctx.beginPath();
    ctx.moveTo(g, -26);
    ctx.lineTo(g, -8);
    ctx.stroke();
  }
  ctx.restore();

  // Sawhorse next to building
  ctx.strokeStyle = "#7a5a30";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx - w / 2 - 18, sy - 12);
  ctx.lineTo(sx - w / 2 - 10, sy);
  ctx.moveTo(sx - w / 2 - 6, sy - 12);
  ctx.lineTo(sx - w / 2 - 14, sy);
  ctx.stroke();
  ctx.strokeStyle = "#8a6a38";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sx - w / 2 - 20, sy - 12);
  ctx.lineTo(sx - w / 2 - 4, sy - 12);
  ctx.stroke();

  drawNameSign(ctx, sx, sy, label, roofPeak - 22);
}

// ─── Contact: Grand base lodge ───

function drawGrandLodge(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string
) {
  const w = 120 * size;
  const h = 65 * size;

  // Shadow
  ctx.fillStyle = "rgba(30, 45, 65, 0.18)";
  ctx.beginPath();
  ctx.ellipse(sx + 4, sy + 6, w * 0.6, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Foundation — heavy stone
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(sx - w / 2 - 4, sy - 5, w + 8, 8);

  // Walls — rich warm logs
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

  // Grand A-frame roof
  const roofPeak = sy - h - 38 * size;
  ctx.fillStyle = "#7a2020";
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx - w / 2 - 16, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 16, sy - h + 3);
  ctx.closePath();
  ctx.fill();

  // Roof ridge highlight
  ctx.strokeStyle = "#8a3030";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sx, roofPeak);
  ctx.lineTo(sx + w / 2 + 16, sy - h + 3);
  ctx.stroke();

  // Snow on roof
  ctx.fillStyle = "rgba(230, 242, 252, 0.85)";
  ctx.beginPath();
  ctx.moveTo(sx - 3, roofPeak + 4);
  ctx.lineTo(sx - w / 2 - 12, sy - h + 3);
  ctx.lineTo(sx + w / 2 + 12, sy - h + 1);
  ctx.closePath();
  ctx.fill();

  drawIcicles(ctx, sx - w / 2 - 10, sx + w / 2 + 10, sy - h + 3);

  // Porch / deck
  ctx.fillStyle = "#6a4a2a";
  ctx.fillRect(sx - w / 2 - 8, sy - 3, w + 16, 5);
  // Porch railing posts
  ctx.fillStyle = "#7a5a3a";
  for (let px = sx - w / 2 - 6; px <= sx + w / 2 + 6; px += 20) {
    ctx.fillRect(px - 1.5, sy - 16, 3, 14);
  }
  // Railing
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sx - w / 2 - 6, sy - 14);
  ctx.lineTo(sx + w / 2 + 6, sy - 14);
  ctx.stroke();

  // Grand double doors
  ctx.fillStyle = "#3e2212";
  ctx.beginPath();
  ctx.roundRect(sx - 14 * size, sy - 38 * size, 28 * size, 35 * size, [6, 6, 0, 0]);
  ctx.fill();
  // Door split
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - 36 * size);
  ctx.lineTo(sx, sy - 3);
  ctx.stroke();
  // Door handles
  ctx.fillStyle = "#c8952a";
  ctx.beginPath();
  ctx.arc(sx - 4, sy - 20 * size, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + 4, sy - 20 * size, 2, 0, Math.PI * 2);
  ctx.fill();
  // Transom window above door
  ctx.fillStyle = "#f0c830";
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(sx, sy - 38 * size + 2, 8 * size, Math.PI, 0);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Windows — 4 across (2 each side of door)
  const winW = 16 * size;
  const winH = 13 * size;
  const windowPositions = [
    sx - w / 2 + 8,
    sx - w / 2 + 28,
    sx + w / 2 - 8 - winW,
    sx + w / 2 - 28 - winW,
  ];
  for (const wx of windowPositions) {
    drawWindow(ctx, wx, sy - h + 16, winW, winH);
  }

  // Two chimneys
  drawChimney(ctx, sx - w / 4, sy - h - 28 * size, size);
  drawChimney(ctx, sx + w / 4, sy - h - 22 * size, size);

  // Warm glow spilling from windows onto snow
  ctx.fillStyle = "rgba(240, 200, 100, 0.06)";
  ctx.beginPath();
  ctx.moveTo(sx - w / 2, sy);
  ctx.lineTo(sx - w / 2 - 20, sy + 15);
  ctx.lineTo(sx + w / 2 + 20, sy + 15);
  ctx.lineTo(sx + w / 2, sy);
  ctx.closePath();
  ctx.fill();

  drawNameSign(ctx, sx, sy, label, roofPeak - 22);
}

// ─── Public API ───

export function drawLodge(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  label: string,
  zoneId?: string
) {
  switch (zoneId) {
    case "about":
      drawInfoCabin(ctx, sx, sy, size, label);
      break;
    case "experience":
      drawOfficeLodge(ctx, sx, sy, size, label);
      break;
    case "education":
      drawAcademicHall(ctx, sx, sy, size, label);
      break;
    case "skills":
      drawWorkshop(ctx, sx, sy, size, label);
      break;
    case "projects":
      drawBuilderShop(ctx, sx, sy, size, label);
      break;
    case "contact":
      drawGrandLodge(ctx, sx, sy, size, label);
      break;
    default:
      drawInfoCabin(ctx, sx, sy, size, label);
      break;
  }
}
