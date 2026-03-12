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
  drawStartOverlay,
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
import ResumePage from "./ResumePage";

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
  const [showResume, setShowResume] = useState(false);
  const showResumeRef = useRef(false);

  const skierRef = useRef<SkierState>(makeSkier());
  const entitiesRef = useRef<WorldEntity[]>([]);
  const inputRef = useRef<InputManager | null>(null);
  const phaseRef = useRef<GamePhase>("start");
  const nearZoneRef = useRef<string | null>(null);
  const frameRef = useRef(0);
  const activeZoneRef = useRef<string | null>(null);

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

  useEffect(() => {
    showResumeRef.current = showResume;
  }, [showResume]);

  const startGame = useCallback(() => {
    setPhase("playing");
    skierRef.current.speed = BASE_GRAVITY;
    startTimeRef.current = Date.now();
    visitedRef.current.clear();
    crashCountRef.current = 0;
  }, []);

  const closeContent = useCallback(() => {
    setActiveZone(null);
    activeZoneRef.current = null;
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
        if (input.anyKey() && !showResumeRef.current) startGame();
      }

      if (currentPhase === "playing") {
        if (input.reset()) resetSkier();

        // Space — enter zone
        if (input.space() && nearZoneRef.current) {
          setActiveZone(nearZoneRef.current);
          activeZoneRef.current = nearZoneRef.current;
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
              activeZoneRef.current = "contact";
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
          activeZoneRef.current = null;
        }
        if (input.escape() && activeZoneRef.current) {
          setActiveZone(null);
          activeZoneRef.current = null;
        }
        if (input.space()) {
          if (activeZoneRef.current) {
            setActiveZone(null);
            activeZoneRef.current = null;
          } else {
            setActiveZone("contact");
            activeZoneRef.current = "contact";
          }
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

      // UI or start overlay (before snow so particles fall on top)
      if (currentPhase === "start") {
        drawStartOverlay(ctx, cw, ch);
      } else {
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

      // Snow on top of everything
      drawSnowParticles(ctx, snow, cw, ch);

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
    <div className="relative w-screen h-dvh overflow-hidden bg-[#dce6ee]">
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
          onViewResume={phase === "finished" ? () => { closeContent(); setShowResume(true); } : undefined}
          onPlayAgain={phase === "finished" ? () => { closeContent(); resetSkier(); setPhase("playing"); } : undefined}
        />
      )}

      {/* Start screen */}
      {phase === "start" && !showResume && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="pointer-events-auto max-w-md w-full">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
              David Reko
            </h1>
            <p className="text-lg sm:text-xl text-sky-400 font-medium mb-6">
              Software Engineer - Generative AI
            </p>

            <div className="w-24 h-px bg-white/20 mx-auto mb-6" />

            <p className="text-slate-400 mb-8 leading-relaxed">
              Ski the mountain to explore my portfolio.
              <br />
              Stop at lodges along the way to learn more.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <button
                onClick={startGame}
                className="w-56 px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 active:bg-amber-400 transition-colors text-lg shadow-lg shadow-amber-500/20"
              >
                Start Skiing
              </button>
              <button
                onClick={() => setShowResume(true)}
                className="w-56 px-6 py-2.5 bg-white/8 text-white/70 border border-white/15 rounded-xl hover:bg-white/15 hover:text-white active:bg-white/15 transition-colors"
              >
                View Resume
              </button>
            </div>

            {/* Controls */}
            <div className="hidden sm:grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-sm text-slate-500 mb-8 justify-center">
              <span className="text-right font-mono text-slate-400">&larr; &rarr;</span>
              <span className="text-left">Steer</span>
              <span className="text-right font-mono text-slate-400">&uarr;</span>
              <span className="text-left">Brake</span>
              <span className="text-right font-mono text-slate-400">&darr;</span>
              <span className="text-left">Tuck (speed up)</span>
              <span className="text-right font-mono text-slate-400">SPACE</span>
              <span className="text-left">Enter lodge</span>
            </div>

            {/* Social links */}
            <div className="flex justify-center gap-5">
              <a
                href="https://github.com/davidreko"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/davidreko"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Resume page */}
      {showResume && (
        <ResumePage
          onClose={() => setShowResume(false)}
          onStartGame={() => { setShowResume(false); startGame(); }}
        />
      )}

      {/* Mobile touch controls */}
      {isMobile && (phase === "playing" || phase === "finished") && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-20 pointer-events-none select-none">
          {/* Steering */}
          <div className="flex gap-3 pointer-events-auto">
            <button
              className="w-16 h-16 rounded-full bg-slate-800/60 border-2 border-slate-600/60 flex items-center justify-center text-white text-2xl shadow-lg active:bg-slate-700/70"
              onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowLeft"); }}
              onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowLeft"); }}
              onTouchCancel={() => inputRef.current?.simulateUp("ArrowLeft")}
            >
              &#9664;
            </button>
            <button
              className="w-16 h-16 rounded-full bg-slate-800/60 border-2 border-slate-600/60 flex items-center justify-center text-white text-2xl shadow-lg active:bg-slate-700/70"
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
                className="w-16 h-16 rounded-full bg-slate-800/60 border-2 border-slate-600/60 flex items-center justify-center text-white text-xs font-bold shadow-lg active:bg-slate-700/70"
                onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowUp"); }}
                onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowUp"); }}
                onTouchCancel={() => inputRef.current?.simulateUp("ArrowUp")}
              >
                BRAKE
              </button>
              <button
                className="w-16 h-16 rounded-full bg-slate-800/60 border-2 border-slate-600/60 flex items-center justify-center text-white text-xs font-bold shadow-lg active:bg-slate-700/70"
                onTouchStart={(e) => { e.preventDefault(); inputRef.current?.simulateDown("ArrowDown"); }}
                onTouchEnd={(e) => { e.preventDefault(); inputRef.current?.simulateUp("ArrowDown"); }}
                onTouchCancel={() => inputRef.current?.simulateUp("ArrowDown")}
              >
                TUCK
              </button>
            </div>
            <button
              className="w-16 h-16 rounded-full bg-sky-600/60 border-2 border-sky-400/50 flex items-center justify-center text-white text-xs font-bold shadow-lg active:bg-sky-500/70"
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
