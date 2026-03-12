import type { SkierState, Camera } from "../types";
import { MAX_TURN } from "../types";
import { toScreen } from "./common";

export function drawSkier(
  ctx: CanvasRenderingContext2D,
  skier: SkierState,
  cam: Camera,
  cw: number,
  ch: number
) {
  const { sx, sy } = toScreen(skier.pos, cam, cw, ch);

  if (skier.invincible > 0 && Math.floor(skier.invincible / 4) % 2 === 0) {
    return;
  }

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
  const brake = skier.isBraking;
  // -1 (hard left) to +1 (hard right)
  const turn = skier.angle / MAX_TURN;
  const absTurn = Math.abs(turn);

  // ─── Compute leg positions (used by skis + legs) ───
  const legShift = turn * 7;
  const hipY = tuck ? -4 : -8;
  const kneeY = tuck ? 1 : 0;
  const bootY = tuck ? 5 : 7;

  // Inner leg bends, outer leg straightens
  const leftKneeX = -4 + legShift + (turn < 0 ? turn * 6 : 0);
  const leftKneeY = kneeY + (turn > 0 ? turn * 4 : 0);
  const leftBootX = -5 + legShift;

  const rightKneeX = 4 + legShift + (turn > 0 ? turn * 6 : 0);
  const rightKneeY = kneeY + (turn < 0 ? -turn * 4 : 0);
  const rightBootX = 5 + legShift;

  // ─── Skis (drawn first, behind legs) ───
  ctx.fillStyle = "#1a2530";
  const skiLen = tuck ? 22 : 20;
  const skiW = 3;
  const skiBaseY = bootY + 2;
  // Skis angle into the turn — both rotate the same direction
  const skiAngle = -turn * 1.2;

  if (brake) {
    // Snowplow: skis splay outward
    ctx.save();
    ctx.translate(leftBootX, skiBaseY);
    ctx.rotate(-0.22);
    ctx.beginPath();
    ctx.roundRect(-skiW / 2, -2, skiW, skiLen, 1.5);
    ctx.fill();
    ctx.fillStyle = "#2a3540";
    ctx.beginPath();
    ctx.ellipse(0, -2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2530";
    ctx.restore();
    ctx.save();
    ctx.translate(rightBootX, skiBaseY);
    ctx.rotate(0.22);
    ctx.beginPath();
    ctx.roundRect(-skiW / 2, -2, skiW, skiLen, 1.5);
    ctx.fill();
    ctx.fillStyle = "#2a3540";
    ctx.beginPath();
    ctx.ellipse(0, -2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2530";
    ctx.restore();
  } else {
    // Carving: both skis angle together into the turn
    ctx.save();
    ctx.translate(leftBootX, skiBaseY);
    ctx.rotate(skiAngle);
    ctx.beginPath();
    ctx.roundRect(-skiW / 2, -2, skiW, skiLen, 1.5);
    ctx.fill();
    // Ski tip (at front of ski)
    ctx.fillStyle = "#2a3540";
    ctx.beginPath();
    ctx.ellipse(0, -2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2530";
    ctx.restore();

    ctx.save();
    ctx.translate(rightBootX, skiBaseY);
    ctx.rotate(skiAngle);
    ctx.beginPath();
    ctx.roundRect(-skiW / 2, -2, skiW, skiLen, 1.5);
    ctx.fill();
    // Ski tip (at front of ski)
    ctx.fillStyle = "#2a3540";
    ctx.beginPath();
    ctx.ellipse(0, -2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2530";
    ctx.restore();
  }

  // ─── Legs (thigh + shin + boot) ───
  // Thighs (hip to knee)
  ctx.strokeStyle = "#1a3050";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-3 + legShift * 0.3, hipY);
  ctx.lineTo(leftKneeX, leftKneeY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3 + legShift * 0.3, hipY);
  ctx.lineTo(rightKneeX, rightKneeY);
  ctx.stroke();

  // Shins (knee to boot)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftKneeX, leftKneeY);
  ctx.lineTo(leftBootX, bootY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightKneeX, rightKneeY);
  ctx.lineTo(rightBootX, bootY);
  ctx.stroke();

  // Boots
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(leftBootX - 2.5, bootY - 1, 5, 5);
  ctx.fillRect(rightBootX - 2.5, bootY - 1, 5, 5);

  // ─── Body / Jacket ───
  // Body leans into the turn
  const bodyLean = turn * 4;
  const bodyTop = tuck ? -9 : -14;
  const bodyH = tuck ? 7 : 8;
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.roundRect(-8 + bodyLean, bodyTop, 16, bodyH, 4);
  ctx.fill();
  // Zipper
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bodyLean, bodyTop + 2);
  ctx.lineTo(bodyLean, bodyTop + bodyH - 2);
  ctx.stroke();
  // Collar
  ctx.fillStyle = "#aa1a1a";
  ctx.fillRect(-6 + bodyLean, bodyTop, 12, 3);

  // ─── Arms ───
  // Downhill arm extends further, uphill arm tucks in
  ctx.strokeStyle = "#cc2222";
  ctx.lineWidth = 3;
  const shoulderY = bodyTop + 4;
  const baseElbow = tuck ? 10 : 12;
  const baseHandY = shoulderY + (tuck ? 3 : 8);

  // Left arm — extends more when turning right (left arm is downhill)
  const leftElbow = baseElbow + (turn > 0 ? turn * 4 : -turn * 2);
  const leftHandY = baseHandY + (turn > 0 ? turn * 3 : 0);
  ctx.beginPath();
  ctx.moveTo(-8 + bodyLean, shoulderY);
  ctx.lineTo(-leftElbow - 3 + bodyLean, leftHandY);
  ctx.stroke();

  // Right arm — extends more when turning left (right arm is downhill)
  const rightElbow = baseElbow + (turn < 0 ? -turn * 4 : turn * 2);
  const rightHandY = baseHandY + (turn < 0 ? -turn * 3 : 0);
  ctx.beginPath();
  ctx.moveTo(8 + bodyLean, shoulderY);
  ctx.lineTo(rightElbow + 3 + bodyLean, rightHandY);
  ctx.stroke();

  // Gloves
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(-leftElbow - 3 + bodyLean, leftHandY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightElbow + 3 + bodyLean, rightHandY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // ─── Poles ───
  ctx.strokeStyle = "#8a9aaa";
  ctx.lineWidth = 1.5;
  // Left pole — plants forward on hard right turn
  const leftPoleEndX = -leftElbow - 1 + bodyLean;
  const leftPoleEndY = leftHandY + 22 - (turn > 0.5 ? (turn - 0.5) * 12 : 0);
  ctx.beginPath();
  ctx.moveTo(-leftElbow - 3 + bodyLean, leftHandY);
  ctx.lineTo(leftPoleEndX, leftPoleEndY);
  ctx.stroke();
  // Right pole — plants forward on hard left turn
  const rightPoleEndX = rightElbow + 1 + bodyLean;
  const rightPoleEndY = rightHandY + 22 - (turn < -0.5 ? (-turn - 0.5) * 12 : 0);
  ctx.beginPath();
  ctx.moveTo(rightElbow + 3 + bodyLean, rightHandY);
  ctx.lineTo(rightPoleEndX, rightPoleEndY);
  ctx.stroke();
  // Baskets
  ctx.strokeStyle = "#6a7a88";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(leftPoleEndX, leftPoleEndY, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rightPoleEndX, rightPoleEndY, 3, 0, Math.PI * 2);
  ctx.stroke();

  // ─── Head ───
  const headY = bodyTop - 6;
  const headLean = turn * 1;
  // Neck
  ctx.fillStyle = "#f0c8a0";
  ctx.fillRect(-2 + bodyLean, bodyTop - 2, 4, 3);
  // Head
  ctx.beginPath();
  ctx.arc(headLean + bodyLean, headY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  // Helmet
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.arc(headLean + bodyLean, headY - 1.5, 7, Math.PI * 1.15, Math.PI * -0.15);
  ctx.fill();
  // Helmet brim
  ctx.fillStyle = "#aa1a1a";
  ctx.beginPath();
  ctx.ellipse(headLean + bodyLean, headY + 1, 7.5, 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Goggles
  ctx.fillStyle = "#12121e";
  ctx.beginPath();
  ctx.roundRect(-6 + headLean + bodyLean, headY - 2.5, 12, 5, 2.5);
  ctx.fill();
  // Goggle lenses
  ctx.fillStyle = "#3498db";
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.arc(-2.5 + headLean + bodyLean, headY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3 + headLean + bodyLean, headY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Lens reflections
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(-3.5 + headLean + bodyLean, headY - 0.8, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2 + headLean + bodyLean, headY - 0.8, 1, 0, Math.PI * 2);
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
  if (absTurn > 0.3 && skier.speed > 2.5 && !brake) {
    const dir = turn > 0 ? -1 : 1;
    const intensity = Math.min(1, absTurn * 1.5);
    const count = Math.floor(4 + intensity * 8);
    for (let i = 0; i < count; i++) {
      const ox = sx + dir * (6 + Math.random() * 22 * intensity);
      const oy = sy + 6 + Math.random() * 16;
      const r = 1 + Math.random() * 3.5 * intensity;
      ctx.fillStyle = `rgba(220, 238, 255, ${(0.2 + Math.random() * 0.4) * intensity})`;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Brake spray (both sides) ───
  if (brake && skier.speed > 1) {
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const ox = sx + side * (4 + Math.random() * 10);
        const oy = sy + 10 + Math.random() * 10;
        const r = 1 + Math.random() * 2.5;
        ctx.fillStyle = `rgba(220, 238, 255, ${0.15 + Math.random() * 0.25})`;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
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
  ctx.rotate(Math.PI / 5 + Math.sin(timer * 0.4) * 0.15);

  if (timer < 15) {
    ctx.fillStyle = `rgba(220, 238, 255, ${0.5 - timer * 0.03})`;
    ctx.beginPath();
    ctx.arc(0, 0, 15 + timer * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#1a2530";
  ctx.save();
  ctx.rotate(0.6);
  ctx.beginPath();
  ctx.roundRect(-16, 6, 3, 18, 1.5);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(-0.8);
  ctx.beginPath();
  ctx.roundRect(4, 9, 3, 16, 1.5);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "#8a9aaa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(8, 15);
  ctx.stroke();

  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.roundRect(-9, -5, 18, 10, 3);
  ctx.fill();
  ctx.fillStyle = "#f0c8a0";
  ctx.beginPath();
  ctx.arc(-6, -10, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.arc(-6, -11.5, 6, Math.PI * 1.1, -0.1);
  ctx.fill();
  ctx.fillStyle = "#12121e";
  ctx.beginPath();
  ctx.roundRect(-10, -12, 9, 3.5, 1.5);
  ctx.fill();

  if (timer < 40) {
    ctx.fillStyle = "#f0c830";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    const orbit = timer * 0.12;
    for (let i = 0; i < 3; i++) {
      const a = orbit + (i * Math.PI * 2) / 3;
      ctx.fillText("\u2726", Math.cos(a) * 18, -15 + Math.sin(a) * 8);
    }
  }

  ctx.restore();
}
