"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { InputManager } from "@/game/input";
import { zones, generateEntities, distVec } from "@/game/world";
import {
  drawBackground,
  drawTerrain,
  drawEntity,
  drawSkier,
  drawZoneIndicator,
  drawUI,
  drawStartScreen,
  drawControls,
} from "@/game/renderer";
import type { SkierState, WorldEntity } from "@/game/types";
import {
  BASE_GRAVITY,
  TUCK_GRAVITY,
  BRAKE_GRAVITY,
  TURN_SPEED,
  MAX_TURN,
  FRICTION,
  MAX_SPEED,
  TRAIL_LENGTH,
  TREE_RADIUS,
  ROCK_RADIUS,
  SKIER_RADIUS,
  WORLD_W,
} from "@/game/types";
import ContentCard from "./ContentCard";

type GamePhase = "start" | "playing" | "viewing";

const INITIAL_POS = { x: 1000, y: 100 };

function makeSkier(): SkierState {
  return {
    pos: { ...INITIAL_POS },
    vel: { x: 0, y: 0 },
    angle: 0,
    speed: 0,
    isTucking: false,
    isBraking: false,
    trail: [],
    crashed: false,
    crashTimer: 0,
    invincible: 0,
  };
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<GamePhase>("start");
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const skierRef = useRef<SkierState>(makeSkier());
  const entitiesRef = useRef<WorldEntity[]>([]);
  const inputRef = useRef<InputManager | null>(null);
  const phaseRef = useRef<GamePhase>("start");
  const nearZoneRef = useRef<string | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const startGame = useCallback(() => {
    setPhase("playing");
    skierRef.current.speed = BASE_GRAVITY;
  }, []);

  const closeContent = useCallback(() => {
    setActiveZone(null);
    setPhase("playing");
  }, []);

  const resetSkier = useCallback(() => {
    const s = skierRef.current;
    s.pos = { ...INITIAL_POS };
    s.vel = { x: 0, y: 0 };
    s.angle = 0;
    s.speed = BASE_GRAVITY;
    s.isTucking = false;
    s.isBraking = false;
    s.trail = [];
    s.crashed = false;
    s.crashTimer = 0;
    s.invincible = 30;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const input = new InputManager();
    inputRef.current = input;
    entitiesRef.current = generateEntities();

    let animId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const skier = skierRef.current;
      const entities = entitiesRef.current;
      const currentPhase = phaseRef.current;

      // ─── Update ───

      if (currentPhase === "start") {
        if (input.anyKey()) startGame();
      }

      if (currentPhase === "playing") {
        // Reset
        if (input.reset()) {
          resetSkier();
        }

        // Space — enter zone
        if (input.space() && nearZoneRef.current) {
          setActiveZone(nearZoneRef.current);
          setPhase("viewing");
          skier.speed = 0;
          skier.vel = { x: 0, y: 0 };
        }

        if (!skier.crashed) {
          // Turning
          if (input.left()) {
            skier.angle = Math.max(skier.angle - TURN_SPEED, -MAX_TURN);
          } else if (input.right()) {
            skier.angle = Math.min(skier.angle + TURN_SPEED, MAX_TURN);
          } else {
            skier.angle *= 0.92;
          }

          skier.isTucking = input.down();
          skier.isBraking = input.up();

          let gravity = BASE_GRAVITY;
          if (skier.isTucking) gravity = TUCK_GRAVITY;
          if (skier.isBraking) gravity = BRAKE_GRAVITY;

          skier.vel.x = Math.sin(skier.angle) * gravity;
          skier.vel.y = Math.cos(skier.angle) * gravity;

          skier.speed =
            Math.sqrt(skier.vel.x ** 2 + skier.vel.y ** 2) * FRICTION;
          if (skier.speed > MAX_SPEED) {
            const scale = MAX_SPEED / skier.speed;
            skier.vel.x *= scale;
            skier.vel.y *= scale;
            skier.speed = MAX_SPEED;
          }

          skier.pos.x += skier.vel.x;
          skier.pos.y += skier.vel.y;

          // World bounds
          skier.pos.x = Math.max(30, Math.min(WORLD_W - 30, skier.pos.x));
          if (skier.pos.y < 0) skier.pos.y = 0;

          // Base lodge funnel — steer + decelerate toward the lodge
          const LODGE_X = 1000;
          const LODGE_Y = 10400;
          const FUNNEL_START = LODGE_Y - 600;
          if (skier.pos.y > FUNNEL_START) {
            const progress = Math.min(1, (skier.pos.y - FUNNEL_START) / (LODGE_Y - FUNNEL_START));
            // Decelerate
            const brakeFactor = 1 - progress * 0.9;
            skier.vel.y *= brakeFactor;
            skier.speed *= brakeFactor;
            // Steer toward lodge X — stronger as you get closer
            const dx = LODGE_X - skier.pos.x;
            skier.pos.x += dx * progress * 0.06;
            skier.vel.x *= (1 - progress * 0.8);
          }
          if (skier.pos.y >= LODGE_Y) {
            skier.pos.y = LODGE_Y;
            skier.pos.x = LODGE_X;
            skier.vel = { x: 0, y: 0 };
            skier.speed = 0;
            if (!nearZoneRef.current) {
              nearZoneRef.current = "contact";
            }
          }

          // Trail
          if (frameRef.current % 2 === 0) {
            skier.trail.push({ ...skier.pos });
            if (skier.trail.length > TRAIL_LENGTH) skier.trail.shift();
          }

          // Invincibility tick
          if (skier.invincible > 0) skier.invincible--;

          // Collision (skip if invincible)
          if (skier.invincible <= 0) {
            for (const ent of entities) {
              if (
                ent.type !== "tree" &&
                ent.type !== "treeSmall" &&
                ent.type !== "rock" &&
                ent.type !== "cliff" &&
                ent.type !== "stump"
              )
                continue;
              const r =
                ent.type === "rock" || ent.type === "stump"
                  ? ROCK_RADIUS * ent.size
                  : ent.type === "cliff"
                    ? 14 * ent.size
                    : TREE_RADIUS * ent.size;
              if (distVec(skier.pos, ent.pos) < r + SKIER_RADIUS) {
                skier.crashed = true;
                skier.crashTimer = 0;
                skier.speed = 0;
                skier.vel = { x: 0, y: 0 };
                break;
              }
            }
          }

          // Zone proximity
          let foundZone: string | null = null;
          for (const zone of zones) {
            if (distVec(skier.pos, zone.pos) < zone.radius) {
              foundZone = zone.id;
              break;
            }
          }
          if (foundZone !== nearZoneRef.current) {
            nearZoneRef.current = foundZone;
          }
        }
        // Crash recovery
        else {
          skier.crashTimer++;
          if (skier.crashTimer > 45) {
            skier.pos.y += 60;
            skier.pos.x += (Math.random() - 0.5) * 40;
            skier.crashed = false;
            skier.invincible = 60;
            skier.speed = BASE_GRAVITY * 0.5;
            skier.angle = 0;
            skier.trail = [];
          }
        }
      }

      if (currentPhase === "viewing") {
        if (input.escape() || input.space()) closeContent();
      }

      // ─── Render ───
      const cam = { x: skier.pos.x, y: skier.pos.y };

      ctx.clearRect(0, 0, cw, ch);
      drawBackground(ctx, cam, cw, ch);
      drawTerrain(ctx, cam, cw, ch);

      // Sort visible entities by Y
      const visible = entities.filter((e) => {
        const sy = e.pos.y - cam.y + ch / 3;
        return sy > -200 && sy < ch + 200;
      });
      visible.sort((a, b) => a.pos.y - b.pos.y);

      // Entities behind skier
      for (const ent of visible) {
        if (ent.pos.y <= skier.pos.y) drawEntity(ctx, ent, cam, cw, ch);
      }

      drawSkier(ctx, skier, cam, cw, ch);

      // Entities in front of skier
      for (const ent of visible) {
        if (ent.pos.y > skier.pos.y) drawEntity(ctx, ent, cam, cw, ch);
      }

      // Zone indicators
      for (const zone of zones) {
        drawZoneIndicator(ctx, zone, cam, cw, ch, nearZoneRef.current === zone.id);
      }

      // UI
      if (currentPhase === "playing" || currentPhase === "viewing") {
        drawUI(
          ctx,
          skier,
          cw,
          ch,
          nearZoneRef.current
            ? zones.find((z) => z.id === nearZoneRef.current)?.label ?? null
            : null
        );
        if (frameRef.current < 350) drawControls(ctx, cw, ch);
      }

      if (currentPhase === "start") drawStartScreen(ctx, cw, ch);

      input.flush();
      frameRef.current++;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      input.destroy();
    };
  }, [startGame, closeContent, resetSkier]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#dce6ee]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {phase === "viewing" && activeZone && (
        <ContentCard zoneId={activeZone} onClose={closeContent} />
      )}
    </div>
  );
}
