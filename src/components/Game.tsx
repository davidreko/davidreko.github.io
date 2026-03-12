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
  drawSnowParticles,
  drawMinimap,
  drawWeatherOverlay,
} from "@/game/renderer";
import type { SkierState, WorldEntity, Snowflake } from "@/game/types";
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

type GamePhase = "start" | "playing" | "viewing" | "finished";

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

function generateSnowflakes(count: number): Snowflake[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 1.5 + Math.random() * 3,
    speedY: 0.0003 + Math.random() * 0.0008,
    speedX: (Math.random() - 0.5) * 0.0003,
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<GamePhase>("start");
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const skierRef = useRef<SkierState>(makeSkier());
  const entitiesRef = useRef<WorldEntity[]>([]);
  const inputRef = useRef<InputManager | null>(null);
  const phaseRef = useRef<GamePhase>("start");
  const nearZoneRef = useRef<string | null>(null);
  const frameRef = useRef(0);

  // Stats
  const visitedRef = useRef<Set<string>>(new Set());
  const crashCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const finishTimeRef = useRef(0);

  // Camera smoothing
  const camRef = useRef({ x: INITIAL_POS.x, y: INITIAL_POS.y });
  const shakeRef = useRef({ x: 0, y: 0 });

  // Snow
  const snowRef = useRef<Snowflake[]>(generateSnowflakes(50));

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const startGame = useCallback(() => {
    setPhase("playing");
    skierRef.current.speed = BASE_GRAVITY;
    startTimeRef.current = Date.now();
    visitedRef.current.clear();
    crashCountRef.current = 0;
  }, []);

  const closeContent = useCallback(() => {
    setActiveZone(null);
    if (phaseRef.current !== "finished") {
      setPhase("playing");
    }
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
    camRef.current = { ...INITIAL_POS };
    startTimeRef.current = Date.now();
    visitedRef.current.clear();
    crashCountRef.current = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const input = new InputManager();
    inputRef.current = input;
    entitiesRef.current = generateEntities();
    setIsMobile("ontouchstart" in window);

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
      const snow = snowRef.current;

      // ─── Update ───

      if (currentPhase === "start") {
        if (input.anyKey()) startGame();
      }

      if (currentPhase === "playing") {
        if (input.reset()) resetSkier();

        // Space — enter zone
        if (input.space() && nearZoneRef.current) {
          setActiveZone(nearZoneRef.current);
          setPhase("viewing");
          skier.speed = 0;
          skier.vel = { x: 0, y: 0 };
          // Track visited
          visitedRef.current.add(nearZoneRef.current);
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

          // Ice patch speed boost
          for (const ent of entities) {
            if (ent.type === "ice") {
              const iceRadius = ent.size * 45;
              if (distVec(skier.pos, ent.pos) < iceRadius) {
                gravity *= 1.6;
                skier.angle *= 0.96; // Reduced grip on ice
                break;
              }
            }
          }

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

          // Base lodge funnel
          const LODGE_X = 1000;
          const LODGE_Y = 10400;
          const FUNNEL_START = LODGE_Y - 600;
          if (skier.pos.y > FUNNEL_START) {
            const progress = Math.min(
              1,
              (skier.pos.y - FUNNEL_START) / (LODGE_Y - FUNNEL_START)
            );
            const brakeFactor = 1 - progress * 0.9;
            skier.vel.y *= brakeFactor;
            skier.speed *= brakeFactor;
            const dx = LODGE_X - skier.pos.x;
            skier.pos.x += dx * progress * 0.06;
            skier.vel.x *= 1 - progress * 0.8;
          }
          if (skier.pos.y >= LODGE_Y) {
            skier.pos.y = LODGE_Y;
            skier.pos.x = LODGE_X;
            skier.vel = { x: 0, y: 0 };
            skier.speed = 0;
            // Trigger finish — show base lodge card with stats
            if (currentPhase === "playing") {
              finishTimeRef.current = Date.now();
              nearZoneRef.current = "contact";
              visitedRef.current.add("contact");
              setPhase("finished");
              setActiveZone("contact");
            }
          }

          // Trail
          if (frameRef.current % 2 === 0) {
            skier.trail.push({ ...skier.pos });
            if (skier.trail.length > TRAIL_LENGTH) skier.trail.shift();
          }

          // Invincibility tick
          if (skier.invincible > 0) skier.invincible--;

          // Collision
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
                crashCountRef.current++;
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

        // Screen shake during crash
        if (skier.crashed && skier.crashTimer < 15) {
          const intensity = (15 - skier.crashTimer) * 0.6;
          shakeRef.current = {
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity,
          };
        } else {
          shakeRef.current = { x: 0, y: 0 };
        }
      }

      if (currentPhase === "viewing") {
        if (input.escape() || input.space()) closeContent();
      }

      if (currentPhase === "finished") {
        if (input.reset()) {
          resetSkier();
          setPhase("playing");
          setActiveZone(null);
        }
        if (input.escape()) {
          setActiveZone(null);
        }
        if (input.space()) {
          setActiveZone("contact");
        }
      }

      // ─── Camera: smooth follow + lead ahead ───
      const leadX = skier.vel.x * 12;
      const leadY = skier.vel.y * 8;
      const targetX = skier.pos.x + leadX;
      const targetY = skier.pos.y + leadY;
      const smoothing = 0.08;
      camRef.current.x += (targetX - camRef.current.x) * smoothing;
      camRef.current.y += (targetY - camRef.current.y) * smoothing;

      const cam = {
        x: camRef.current.x + shakeRef.current.x,
        y: camRef.current.y + shakeRef.current.y,
      };

      // ─── Update snow particles ───
      for (const flake of snow) {
        flake.y += flake.speedY;
        flake.x += flake.speedX + Math.sin(frameRef.current * 0.01 + flake.y * 10) * 0.0001;
        if (flake.y > 1.05) {
          flake.y = -0.05;
          flake.x = Math.random();
        }
        if (flake.x < -0.05) flake.x = 1.05;
        if (flake.x > 1.05) flake.x = -0.05;
      }

      // ─── Render ───
      ctx.clearRect(0, 0, cw, ch);
      drawBackground(ctx, cam, cw, ch);
      drawTerrain(ctx, cam, cw, ch);

      // Sort visible entities by Y
      const visible = entities.filter((e) => {
        const sy = e.pos.y - cam.y + ch / 3;
        return sy > -200 && sy < ch + 200;
      });
      visible.sort((a, b) => a.pos.y - b.pos.y);

      for (const ent of visible) {
        if (ent.pos.y <= skier.pos.y) drawEntity(ctx, ent, cam, cw, ch);
      }

      drawSkier(ctx, skier, cam, cw, ch);

      for (const ent of visible) {
        if (ent.pos.y > skier.pos.y) drawEntity(ctx, ent, cam, cw, ch);
      }

      for (const zone of zones) {
        drawZoneIndicator(
          ctx,
          zone,
          cam,
          cw,
          ch,
          nearZoneRef.current === zone.id
        );
      }

      // Weather overlay (fog builds with altitude)
      drawWeatherOverlay(ctx, cam, cw, ch);

      // Snow on top of everything
      drawSnowParticles(ctx, snow, cw, ch);

      // UI
      if (currentPhase !== "start") {
        const elapsed = currentPhase === "finished"
          ? finishTimeRef.current - startTimeRef.current
          : Date.now() - startTimeRef.current;
        drawUI(
          ctx,
          skier,
          cw,
          ch,
          nearZoneRef.current
            ? zones.find((z) => z.id === nearZoneRef.current)?.label ?? null
            : null,
          visitedRef.current.size,
          zones.length,
          elapsed,
          crashCountRef.current
        );
        drawMinimap(ctx, cw, ch, skier.pos, zones, visitedRef.current);
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
      {activeZone && (phase === "viewing" || phase === "finished") && (
        <ContentCard
          zoneId={activeZone}
          onClose={closeContent}
          stats={phase === "finished" ? {
            elapsed: finishTimeRef.current - startTimeRef.current,
            crashes: crashCountRef.current,
            visited: visitedRef.current.size,
            totalZones: zones.length,
          } : undefined}
        />
      )}

      {/* Mobile: tap to start */}
      {isMobile && phase === "start" && (
        <div
          className="absolute inset-0 z-10"
          onTouchStart={(e) => {
            e.preventDefault();
            inputRef.current?.simulateDown(" ");
            setTimeout(() => inputRef.current?.simulateUp(" "), 100);
          }}
        />
      )}

      {/* Mobile touch controls */}
      {isMobile && (phase === "playing" || phase === "finished") && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4 pb-6 z-10 pointer-events-none select-none">
          {/* Steering */}
          <div className="flex gap-3 pointer-events-auto">
            <button
              className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-2xl active:bg-white/30"
              onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowLeft"); }}
              onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowLeft"); }}
              onTouchCancel={() => inputRef.current?.simulateUp("ArrowLeft")}
            >
              &#9664;
            </button>
            <button
              className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-2xl active:bg-white/30"
              onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowRight"); }}
              onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowRight"); }}
              onTouchCancel={() => inputRef.current?.simulateUp("ArrowRight")}
            >
              &#9654;
            </button>
          </div>

          {/* Speed + Action */}
          <div className="flex gap-3 items-end pointer-events-auto">
            <div className="flex flex-col gap-3">
              <button
                className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-xs font-bold active:bg-white/30"
                onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowUp"); }}
                onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowUp"); }}
                onTouchCancel={() => inputRef.current?.simulateUp("ArrowUp")}
              >
                BRAKE
              </button>
              <button
                className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-xs font-bold active:bg-white/30"
                onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowDown"); }}
                onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowDown"); }}
                onTouchCancel={() => inputRef.current?.simulateUp("ArrowDown")}
              >
                TUCK
              </button>
            </div>
            <button
              className="w-16 h-16 rounded-full bg-sky-500/25 border-2 border-sky-400/40 flex items-center justify-center text-white text-xs font-bold active:bg-sky-500/40"
              onTouchStart={(e) => {
                e.preventDefault();
                inputRef.current?.simulateDown(" ");
                setTimeout(() => inputRef.current?.simulateUp(" "), 100);
              }}
            >
              {phase === "finished" ? "VIEW" : "ACT"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
